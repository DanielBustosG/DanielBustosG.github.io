# Regenerates data/publications.json from OpenAlex.
# Usage:  powershell -ExecutionPolicy Bypass -File .\update-publications.ps1
# The website reads OpenAlex live on load; this file is the offline fallback.

$ErrorActionPreference = 'Stop'

$Mailto   = 'danielbustos.ibi@gmail.com'       # OpenAlex polite-pool contact
$OutFile  = Join-Path $PSScriptRoot 'data\publications.json'

# OpenAlex split this author across THREE entities, so one filter is not enough:
#   A5065920526  main profile, 73 works, carries the ORCID
#   A5140677645  the RSC Advances RgpB paper only, also carries the ORCID
#   A5137396268  the Calcium-Alginate paper only, NO ORCID recorded
# Filtering by ORCID catches the first two automatically (74 works) and keeps working
# for future papers indexed under new entities — but it misses any entity where
# OpenAlex failed to record the ORCID, hence the explicit ID below.
# Results from every filter are merged and de-duplicated by title.
#
# If a known paper stops showing up, look it up at https://api.openalex.org/works?search=<title>,
# read the author id next to "Daniel Bustos", and add 'author.id:<id>' here.
# Keep in sync with CONFIG.authorFilters in assets/js/app.js.
$AuthorFilters = @(
    'author.orcid:0000-0002-2136-2305',
    'author.id:A5137396268'
)

# OpenAlex merges several namesakes into this author ID, and nearly all of that
# contamination predates the real career (gastroenterology 1989-2001, chemistry
# education 2012...). The Scholar profile starts in 2016, so this floor removes the
# bulk of it without maintaining a list of other people's titles.
# Keep in sync with CONFIG.minYear in assets/js/app.js.
$MinYear = 2016

# OpenAlex merged several researchers named Daniel Bustos into this author ID (its
# internal display_name is "Daniel Sebastian Bravo Bustos"), and Scholar adds another.
# These titles belong to the namesakes: sociology, differential geometry, cardiology
# and clinical biochemistry. Compared after lowercasing + stripping accents/punctuation.
# Keep in sync with CONFIG.blocklist in assets/js/app.js.
$TitleBlocklist = @(
    'el barrio esta en extincion',
    'transformaciones en la estructura socio-ocupacional de la provincia de nuble mirada desde la perspectiva funcionalista',
    'influencia do frio extremo na temperatura interna corporal na pressao arterial sanguinea e frequencia cardiaca',
    'variabilidade biologica de aldolase serica sua utilidade na interpretacao dos resultados',
    'biological variation of serum aldolase its use for interpretation of the results variabilidade biologica de aldolase serica sua utilidade na interpretacao dos resultados',
    'on the existence of foliations by solutions to the exterior dirichlet problem for the minimal surface equation',
    'harmonic gauss maps of submanifolds of arbitrary codimension of the euclidean space and sphere and some applications',
    'paradoxical low flowlow gradient severe aortic stenosis a clinical entity or a scientific artifact',
    # Review clinico de otro Daniel Bustos; posterior a $MinYear, asi que solo la lista lo saca.
    'psychological and behavioral effects of glp1 and gip agonists in weight loss a comprehensive review'
)

function Get-Prop($obj, $name) {
    if ($null -eq $obj) { return $null }
    $p = $obj.PSObject.Properties[$name]
    if ($null -eq $p) { return $null }
    return $p.Value
}

function Remove-Diacritics([string]$s) {
    if ([string]::IsNullOrEmpty($s)) { return '' }
    $norm = $s.Normalize([Text.NormalizationForm]::FormD)
    $sb = New-Object Text.StringBuilder
    foreach ($c in $norm.ToCharArray()) {
        if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($c) -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$sb.Append($c)
        }
    }
    return $sb.ToString()
}

# Some OpenAlex titles carry escaped markup, e.g. "&lt;strong&gt;...&lt;/strong&gt;".
function Clear-Markup([string]$s) {
    if ([string]::IsNullOrEmpty($s)) { return $s }
    $s = [Net.WebUtility]::HtmlDecode($s)   # &lt;em&gt; -> <em>, &amp;amp; -> &
    $s = [Net.WebUtility]::HtmlDecode($s)   # double-encoded in places
    $s = $s -replace '<[^>]+>', ''          # drop the now-real tags
    return ($s -replace '\s+', ' ').Trim()
}

# 'select' must exclude abstract_inverted_index: its keys differ only by case
# ("the"/"The"), and PS 5.1 ConvertFrom-Json is case-insensitive, so it throws
# DuplicateKeysInJsonString on the full record. Invoke-RestMethod swallows that
# and returns $null, hence Invoke-WebRequest + explicit ConvertFrom-Json.
$Select = 'id,doi,title,publication_year,cited_by_count,type,biblio,primary_location,open_access,authorships'

$all = @()

foreach ($filter in $AuthorFilters) {
    $cursor = '*'
    $got = 0
    while ($cursor) {
        $url = 'https://api.openalex.org/works?filter={0}&per-page=200&cursor={1}&select={2}&mailto={3}' -f $filter, $cursor, $Select, $Mailto
        $raw = (Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing).Content
        $page = $raw | ConvertFrom-Json

        # @(...) forces an array: ConvertFrom-Json unrolls a single-element result set,
        # and .Count on the bare object then reports the wrong number.
        $results = @(Get-Prop $page 'results')
        if ($results.Count -gt 0) { $all += $results; $got += $results.Count }

        $meta = Get-Prop $page 'meta'
        $cursor = Get-Prop $meta 'next_cursor'
        if ($results.Count -eq 0) { break }
    }
    Write-Host ("  {0} -> {1} records" -f $filter, $got)
}

Write-Host ("Retrieved {0} raw records across {1} filters." -f $all.Count, $AuthorFilters.Count)

$pubs = New-Object System.Collections.ArrayList
$seen = @{}

foreach ($w in $all) {
    $title = Clear-Markup (Get-Prop $w 'title')
    if ([string]::IsNullOrWhiteSpace($title)) { continue }

    $year = Get-Prop $w 'publication_year'
    if ($year -and [int]$year -lt $MinYear) {
        Write-Host "  skip (pre-$MinYear): $title"
        continue
    }

    $key = (Remove-Diacritics $title).ToLower() -replace '[^a-z0-9]', ''

    # Must match normTitle() in assets/js/app.js exactly.
    $norm = ((((Remove-Diacritics $title).ToLower() -replace '[^a-z0-9 ]', '') -replace '\s+', ' ')).Trim()
    if ($TitleBlocklist -contains $norm) {
        Write-Host "  skip (not this author): $title"
        continue
    }

    # OpenAlex keeps preprint + published versions as separate works; keep the richer one.
    if ($seen.ContainsKey($key)) {
        $prev = $seen[$key]
        $prevCites = [int](Get-Prop $prev 'cited_by_count')
        $thisCites = [int](Get-Prop $w 'cited_by_count')
        if ($thisCites -le $prevCites) { continue }
        $pubs.Remove($prev) | Out-Null
    }

    $doi = Get-Prop $w 'doi'
    $loc = Get-Prop $w 'primary_location'
    $src = Get-Prop $loc 'source'
    $oa  = Get-Prop $w 'open_access'
    $bib = Get-Prop $w 'biblio'

    $authors = @()
    foreach ($a in (Get-Prop $w 'authorships')) {
        $n = Get-Prop $a 'raw_author_name'
        if (-not $n) { $n = Get-Prop (Get-Prop $a 'author') 'display_name' }
        if ($n) { $authors += $n }
    }

    $rec = [ordered]@{
        id        = Get-Prop $w 'id'
        title     = $title
        authors   = $authors
        venue     = if ($src) { Get-Prop $src 'display_name' } else { $null }
        year      = $year
        volume    = Get-Prop $bib 'volume'
        issue     = Get-Prop $bib 'issue'
        pages     = if ((Get-Prop $bib 'first_page') -and (Get-Prop $bib 'last_page')) {
                        '{0}-{1}' -f (Get-Prop $bib 'first_page'), (Get-Prop $bib 'last_page')
                    } else { Get-Prop $bib 'first_page' }
        doi       = $doi
        url       = if ($doi) { $doi } else { Get-Prop $loc 'landing_page_url' }
        oa_url    = Get-Prop $oa 'oa_url'
        citations = [int](Get-Prop $w 'cited_by_count')
        type      = Get-Prop $w 'type'
    }

    $obj = [pscustomobject]$rec
    [void]$pubs.Add($obj)
    $seen[$key] = $obj
}

$sorted = $pubs | Sort-Object -Property @{Expression = 'year'; Descending = $true},
                                        @{Expression = 'citations'; Descending = $true}

$payload = [ordered]@{
    generated  = (Get-Date -Format 'yyyy-MM-dd')
    source     = 'OpenAlex'
    filters    = $AuthorFilters
    count      = $sorted.Count
    citations  = ($sorted | Measure-Object -Property citations -Sum).Sum
    works      = $sorted
}

$json = $payload | ConvertTo-Json -Depth 8
[IO.File]::WriteAllText($OutFile, $json, (New-Object Text.UTF8Encoding $false))

Write-Host ""
Write-Host ("Wrote {0}" -f $OutFile)
Write-Host ("  {0} publications, {1} total citations" -f $sorted.Count, $payload.citations)
