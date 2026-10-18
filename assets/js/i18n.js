/* ============================================================
   Traducciones al inglés.

   CÓMO FUNCIONA
   El español vive en index.html y es la fuente de la verdad: la página
   funciona sin JavaScript y los buscadores la indexan en español. Al cargar,
   app.js guarda una copia del español del DOM, así que aquí solo hace falta
   el inglés — nunca hay que duplicar el español en dos lugares.

   CÓMO EDITAR
   Cada clave corresponde a un atributo data-i18n="clave" en index.html.
   El valor es HTML y reemplaza el contenido completo de ese elemento, así que
   debe conservar la misma estructura interna (mismos <li>, <strong>, clases...).
   Si editas un texto en español en index.html, actualiza su par aquí.
   Una clave que falte simplemente deja el español visible: no rompe nada.
   ============================================================ */

var I18N_EN = {

  /* ── Navegación y cabecera ─────────────────────────────── */
  skip: 'Skip to content',
  brand_sub: 'Structural Bioinformatics · UCM',
  nav_about: 'About',
  nav_research: 'Research',
  nav_pubs: 'Publications',
  nav_group: 'Group',
  nav_projects: 'Projects',
  nav_courses: 'Courses',
  nav_contact: 'Contact',

  /* ── Inicio ────────────────────────────────────────────── */
  hero_eyebrow: 'Universidad Católica del Maule · Faculty of Medicine',
  hero_lede:
    'I study how proteins behave at the atomic scale and use that knowledge to design ' +
    'molecules with therapeutic potential. I combine <strong>structural bioinformatics</strong>, ' +
    '<strong>molecular dynamics simulations</strong> and <strong>machine learning</strong> ' +
    'to go from structure to mechanism, and from mechanism to drug.',
  hero_affil:
    'Associate Professor and researcher at the <strong>Bioinformatics and Computational ' +
    'Chemistry Laboratory (LBQC)</strong>, Faculty of Medicine, Universidad Católica del ' +
    'Maule, Talca, Chile.',
  hero_cta_pubs: 'See publications',
  hero_cta_research: 'Research lines',

  metric_works: 'Publications',
  metric_citations: 'Citations',
  metric_h: 'h-index',
  metric_i10: 'i10-index',

  /* ── Sobre mí ──────────────────────────────────────────── */
  s1_eyebrow: '01 — Profile',
  s1_title: 'About me',
  about_prose:
    '<p>I am a <strong>Bioinformatics Engineer</strong> and hold a <strong>PhD in Applied ' +
    'Sciences</strong> from Universidad de Talca. I currently work as an Associate Professor ' +
    'and researcher at the Faculty of Medicine of Universidad Católica del Maule, where I took ' +
    'part in the <strong>co-creation of the Bioinformatics and Computational Chemistry ' +
    'Laboratory (LBQC)</strong>.</p>' +
    '<p>My work sits at the boundary between the physics of biomolecules and drug discovery. ' +
    'One question runs through all of it: <em>how does a protein\'s dynamics — not just its ' +
    'static structure — determine where and how a ligand binds?</em> To answer it I combine, ' +
    'among other techniques, all-atom molecular dynamics, metadynamics, ensemble-based virtual screening and machine ' +
    'learning models trained on physicochemical properties.</p>' +
    '<p>This approach has let me work on very different systems: ion channels (TRPV1, TASK/K2P, ' +
    'hERG, TRPV5/6), bacterial enzymes such as <em>Helicobacter pylori</em> <em>urease</em> and ' +
    'the RND efflux pumps of <em>Pseudomonas aeruginosa</em>, strawberry ripening and aroma, and ' +
    'the design of polymers and nanocarriers for controlled release. The common thread is not ' +
    'the biological system, but the method.</p>' +
    '<p>On the teaching side I take part in the <strong>Medical Bioengineering</strong> degree ' +
    'at UCM, in the Bioinformatics track. I am also a faculty member of three graduate ' +
    'programmes at Universidad Católica del Maule: the <strong>MSc in Computer Science</strong>, ' +
    'the <strong>PhD in Engineering</strong> and the <strong>PhD in Translational ' +
    'Biotechnology</strong>.</p>',

  about_edu_h: 'Education',
  about_edu_list:
    '<li><span class="tl-year">PhD</span><div><strong>PhD in Applied Sciences</strong>' +
    '<span>Universidad de Talca</span></div></li>' +
    '<li><span class="tl-year">BEng</span><div><strong>Bioinformatics Engineering</strong>' +
    '<span>Universidad de Talca</span></div></li>',

  about_areas_h: 'Areas of work',
  about_areas_list:
    '<li>Structural bioinformatics</li><li>Molecular dynamics</li><li>Drug design</li>' +
    '<li>Machine learning</li><li>Virtual screening</li><li>Data science</li>',

  about_methods_list:
    '<li>GROMACS / AMBER</li><li>Metadynamics</li><li>Ensemble docking</li><li>QM/MM</li>' +
    '<li>Free energies (MM-PBSA)</li><li>Python / scikit-learn</li>',
  about_methods_note: 'Edit this list in <code>index.html</code> to match your exact stack.',

  /* ── Etiquetas reutilizadas en varias tarjetas ─────────── */
  lbl_methods: 'Methods',
  lbl_systems: 'Systems',
  lbl_key_pubs: 'Key publications',
  lbl_collab: 'Collaboration',
  lbl_relevance: 'Relevance',
  lbl_targets: 'Targets',
  lbl_enzymes: 'Enzymes',
  lbl_materials: 'Materials',
  lbl_applications: 'Applications',

  /* ── Investigación ─────────────────────────────────────── */
  s2_eyebrow: '02 — Lines',
  s2_title: 'Research',
  s2_sub:
    'Some of the systems my group investigates, all approached the same way: understand the ' +
    'mechanism at the atomic scale and use it to design. Select a tab to explore each line.',

  tab_channels: '<span class="tab-ico">⚡</span> Ion channels',
  tab_urease: '<span class="tab-ico">🦠</span> Urease · <i>H. pylori</i>',
  tab_pseudo: '<span class="tab-ico">🧫</span> <i>P. aeruginosa</i>',
  tab_straw: '<span class="tab-ico">🍓</span> Strawberry · ripening',
  tab_poly: '<span class="tab-ico">💊</span> Polymers · delivery',

  r_channels_prose:
    '<h3>Ion channels: from the gate to the drug</h3>' +
    '<p>Ion channels translate physical and chemical signals into electrical current. They are ' +
    'first-rate pharmacological targets, but also notoriously difficult ones: their binding ' +
    'sites are often <em>cryptic</em> and appear only in certain conformational states. This is ' +
    'where simulation provides what a static structure cannot.</p>' +
    '<h4>Questions we address</h4>' +
    '<ul>' +
    '<li>What determines <strong>inactivation kinetics</strong> in calcium-selective TRP ' +
    'channels? We identified an intracellular helix-loop-helix domain that modulates it, and ' +
    'traced its evolutionary variation.</li>' +
    '<li>How does the TASK-2 channel <strong>sense intracellular pH</strong>? We elucidated the ' +
    'structural basis of the mechanism.</li>' +
    '<li>Why does <strong>hERG1</strong> deactivate so slowly? We described an intracellular ' +
    'hydrophobic nexus critical to that process.</li>' +
    '<li>Can <strong>capsaicin analogues</strong> for TRPV1 be designed cost-effectively? We ' +
    'proposed a rational design and selection pipeline.</li>' +
    '</ul>' +
    '<h4>Approach</h4>' +
    '<p>All-atom molecular dynamics over conformational ensembles, cavity analysis along the ' +
    'trajectory, <i>in silico</i> mutagenesis tested against our collaborators\' experimental ' +
    'electrophysiology, and more recently integration with machine learning and drug ' +
    'repurposing.</p>',

  r_urease_prose:
    '<h3><i>Helicobacter pylori</i> urease: inhibitors by computational design</h3>' +
    '<p><i>H. pylori</i> colonises the human stomach thanks to its <strong>urease</strong>, a ' +
    'nickel metalloenzyme that hydrolyses urea and neutralises the acidic environment. ' +
    'Inhibiting it is an attractive strategy against growing antibiotic resistance — but the ' +
    'active site is narrow, charged and highly dependent on the dynamics of a flexible flap.</p>' +
    '<h4>A layered strategy</h4>' +
    '<ol>' +
    '<li><strong>ML filtering.</strong> We train classifiers using physicochemical properties as ' +
    'filter criteria, which sharply reduces the chemical space before docking.</li>' +
    '<li><strong>Comparative virtual screening.</strong> We systematically benchmark virtual ' +
    'screening methodologies for predicting urease inhibitory activity — what works and what ' +
    'does not, with data.</li>' +
    '<li><strong>Repurposing.</strong> We scan approved drugs for potent new chemical ' +
    'scaffolds.</li>' +
    '<li><strong>Metadynamics.</strong> We estimate binding free energies and characterise the ' +
    'ligand entry pathway, not just the final pose.</li>' +
    '<li><strong><i>In silico</i> ADME.</strong> We discard unviable candidates before proposing ' +
    'them.</li>' +
    '</ol>' +
    '<h4>Results</h4>' +
    '<p>We have reported triazole-based inhibitors through an integrated framework of machine ' +
    'learning, virtual screening and metadynamics, and uncovered new chemical scaffolds by drug ' +
    'repurposing. In parallel we published a comparative analysis of methodologies that serves ' +
    'as a reference for the field.</p>',
  r_urease_methods:
    '<li>Machine learning</li><li>Virtual screening</li><li>Drug repurposing</li>' +
    '<li>Metadynamics</li><li>ADME</li><li>Molecular dynamics</li>',
  r_urease_relevance:
    '<i>H. pylori</i> infects about half the world\'s population and is classified as a group 1 ' +
    'carcinogen. Clarithromycin resistance places it on the WHO priority pathogens list.',

  r_pseudo_prose:
    '<h3><i>Pseudomonas aeruginosa</i>: RND pumps and phosphorylcholine phosphatase</h3>' +
    '<p><i>P. aeruginosa</i> is an opportunistic ESKAPE pathogen and one of the WHO\'s priority ' +
    'threats. Its resistance does not rest only on enzymes that degrade antibiotics, but on an ' +
    'architecture of <strong>active efflux</strong> that empties the drug out of the cell before ' +
    'it can act. We attack the problem on two fronts.</p>' +
    '<h4>RND efflux pumps</h4>' +
    '<p>Pumps of the <em>Resistance-Nodulation-Division</em> family are tripartite complexes ' +
    'spanning both membranes. We apply <strong>subtractive proteomics</strong> to narrow the ' +
    'proteome down to essential targets with no human homologue, then <strong>ensemble ' +
    'docking</strong> over conformations extracted from molecular dynamics to repurpose approved ' +
    'drugs as potential efflux inhibitors. The logic: a pump inhibitor does not kill the ' +
    'bacterium, but it restores the potency of antibiotics we already have.</p>' +
    '<h4>Phosphorylcholine phosphatase (PchP)</h4>' +
    '<p>PchP takes part in phosphorylcholine metabolism and contributes to virulence. We ' +
    'characterised its <strong>inhibition site</strong> structurally, describing how the ligand ' +
    'and divalent cations modulate enzymatic activity — information any rational design on this ' +
    'target requires.</p>',
  r_pseudo_targets: '<li>RND pumps</li><li>PchP</li><li>Essential proteome</li>',
  r_pseudo_methods:
    '<li>Subtractive proteomics</li><li>Ensemble docking</li>' +
    '<li>Drug repurposing</li><li>Cavity analysis</li>',

  r_straw_prose:
    '<h3>Strawberry: the molecular chemistry of aroma and ripening</h3>' +
    '<p>The flavour of a strawberry is the result of an enzymatic network that switches on ' +
    'during ripening. Understanding it structurally and transcriptionally opens the door to ' +
    'improving quality and postharvest life without resorting to trial and error. We work on ' +
    '<i>Fragaria</i>, combining gene expression with structural modelling of the enzymes ' +
    'responsible.</p>' +
    '<h4>Enzyme families studied</h4>' +
    '<ul>' +
    '<li><strong>AAT</strong> — alcohol acyltransferases: the key step in the aroma puzzle, ' +
    'responsible for the characteristic volatile esters.</li>' +
    '<li><strong>ADH</strong> — alcohol dehydrogenases: we characterised how their expression ' +
    'changes throughout ripening.</li>' +
    '<li><strong>PDC</strong> — pyruvate decarboxylases: structural and transcriptional ' +
    'characterisation of the gene family.</li>' +
    '<li><strong>HPL</strong> — hydroperoxide lyases: developmental regulation of green volatile ' +
    'biosynthesis.</li>' +
    '<li><strong>α-mannosidase 8</strong> — its modulation by Antarctic endophytic fungi under ' +
    'heat waves and water deficit.</li>' +
    '</ul>' +
    '<h4>Why it matters</h4>' +
    '<p>Climate change subjects crops to thermal and water stress that degrades quality and ' +
    'yield. Part of our work explores whether extremophile microorganisms — Antarctic ' +
    'endophytes — can confer tolerance, and what happens at the molecular level when they do.</p>',
  r_straw_collab:
    'Luis Morales-Quintana (U. Autónoma de Chile).',

  r_poly_prose:
    '<h3>Polymers and nanocarriers: designing the container, not just the cargo</h3>' +
    '<p>An active molecule is of little use if it does not reach where it should, in the right ' +
    'amount and at the right time. We model polymer matrices and nanocarriers to understand — at ' +
    'the molecular scale — how they confine, protect and release their cargo.</p>' +
    '<h4>Systems</h4>' +
    '<ul>' +
    '<li><strong>Calcium–alginate networks.</strong> How calcium coordination modulates ligand ' +
    'confinement and biological response, in a multiscale computational–experimental study.</li>' +
    '<li><strong>Alginate–chitosan blends.</strong> Controlled release of abscisic acid (ABA) ' +
    'through a synergistic cross-linked gel approach.</li>' +
    '<li><strong>NLCs</strong> (lipid nanocarriers) with covalently integrated dyes, for ' +
    'simultaneous therapeutic and diagnostic performance.</li>' +
    '<li><strong>Hydrogels for cationic antimicrobial peptides</strong>, rationally designed by ' +
    'molecular modelling.</li>' +
    '<li><strong>Nanoparticles for remediation.</strong> Removal of carbamate pesticides and ' +
    'glyphosate from aqueous solutions.</li>' +
    '<li><strong>Nanoencapsulation of radiolabelled anthocyanins</strong>, with a measurable ' +
    'increase in oral bioavailability and changes in biodistribution.</li>' +
    '</ul>' +
    '<h4>Approach</h4>' +
    '<p>The common point is treating the material as a simulable molecular system: molecular ' +
    'dynamics of the polymer matrix, analysis of host–guest interactions (for example cyclic ' +
    'alcohols in β-cyclodextrin), and experimental validation with our collaborators in ' +
    'chemistry and pharmacy.</p>',
  r_poly_materials:
    '<li>Alginate</li><li>Chitosan</li><li>NLCs</li>' +
    '<li>β-cyclodextrin</li><li>Hydrogels</li><li>PVA</li>',
  r_poly_apps:
    '<li>Controlled release</li><li>Environmental remediation</li>' +
    '<li>Theranostics</li><li>Agrochemicals</li>',

  /* ── Publicaciones ─────────────────────────────────────── */
  s3_eyebrow: '03 — Output',
  s3_title: 'Publications',
  s3_sub:
    'Complete list, newest to oldest. It updates automatically from ' +
    '<a href="https://openalex.org" target="_blank" rel="noopener">OpenAlex</a> every time the ' +
    'page loads, so a new article shows up here without editing any code.',
  pub_search_ph: 'Search by title, author or journal…',
  pub_year: 'Year',
  pub_type: 'Type',
  pub_sort: 'Sort',
  pub_all: 'All',
  pub_sort_year: 'Newest',
  pub_sort_cites: 'Most cited',
  th_year: 'Year',
  th_pub: 'Publication',
  th_cites: 'Cites',
  th_link: 'Link',

  /* ── Grupo ─────────────────────────────────────────────── */
  s4_eyebrow: '04 — Team',
  s4_title: 'Research group',
  s4_sub:
    'Bioinformatics and Computational Chemistry Laboratory (LBQC) — Faculty of Medicine, ' +
    'Universidad Católica del Maule.',
  group_intro:
    '<p>The LBQC was founded at the Faculty of Medicine of UCM with a simple idea: bring ' +
    'computing power and molecular modelling to concrete biomedical questions, and do it from ' +
    'the regions. We work at the intersection of structural bioinformatics, computational ' +
    'chemistry and data science, almost always in close collaboration with experimental groups ' +
    'that put our predictions to the test.</p>' +
    '<p>We train undergraduate and graduate students in molecular simulation, scientific ' +
    'programming and computer-aided drug design.</p>',
  group_members_h: 'Daniel Bustos group',
  group_people:
    '<section class="roster-group"><h4>Research assistants</h4><ul class="roster-list"><li><s' +
    'trong>Antonia Flores</strong><span>Medical Bioengineer · Universidad Católica del Maule<' +
    '/span></li><li><strong>Constanza Henríquez</strong><span>Bioinformatics Engineer · Unive' +
    'rsidad de Talca</span></li></ul></section><section class="roster-group"><h4>PhD students' +
    '</h4><ul class="roster-list"><li><strong>Gabriela Urra</strong><span>PhD in Sciences, Mo' +
    'delling of Chemical and Biological Systems · Universidad de Talca</span></li><li><strong' +
    '>Camila Flores</strong><span>PhD in Engineering · Universidad Católica del Maule</span><' +
    '/li><li><strong>Natalia Morales</strong><span>PhD in Engineering · Universidad Católica ' +
    'del Maule</span></li><li><strong>Elizabeth Valdés</strong><span>PhD in Translational Bio' +
    'technology · Universidad Católica del Maule</span><span class="grad">Graduated · 2026</s' +
    'pan></li></ul></section><section class="roster-group"><h4>MSc students</h4><ul class="ro' +
    'ster-list"><li><strong>Natalia Morales</strong><span>MSc in Computer Science · Universid' +
    'ad Católica del Maule</span><span class="grad">Graduated · 2024</span></li><li><strong>C' +
    'amila Flores</strong><span>MSc in Computer Science · Universidad Católica del Maule</spa' +
    'n><span class="grad">Graduated · 2024</span></li><li><strong>Verónica Leddermann</strong' +
    '><span>MSc in Computer Science · Universidad Católica del Maule</span><span class="grad"' +
    '>Graduated · 2025</span></li><li><strong>Jaime González</strong><span>MSc in Computer Sc' +
    'ience · Universidad Católica del Maule</span><span class="grad">Graduated · 2025</span><' +
    '/li></ul></section><section class="roster-group"><h4>Undergraduate students</h4><ul clas' +
    's="roster-list"><li><strong>Javier Farías</strong><span>Medical Bioengineering · Univers' +
    'idad Católica del Maule · 5th year</span></li><li><strong>Vicente Rojas</strong><span>Me' +
    'dical Bioengineering · Universidad Católica del Maule · 5th year</span></li><li><strong>' +
    'David Alarcón</strong><span>Medical Bioengineering · Universidad Católica del Maule · 5t' +
    'h year</span></li><li><strong>Sofía Herrera</strong><span>Medical Bioengineering · Unive' +
    'rsidad Católica del Maule · 5th year</span></li><li><strong>José Gálvez</strong><span>Me' +
    'dical Bioengineering · Universidad Católica del Maule · 4th year</span></li><li><strong>' +
    'Fernanda Sáez</strong><span>Medical Bioengineering · Universidad Católica del Maule · 4t' +
    'h year</span></li><li><strong>Nicolás Carrasco</strong><span>Medical Bioengineering · Un' +
    'iversidad Católica del Maule · 4th year</span></li><li><strong>Sofía Ríos-Rozas</strong>' +
    '<span>Medical Bioengineering · Universidad Católica del Maule</span><span class="grad">G' +
    'raduated</span></li><li><strong>Gabriela Urra</strong><span>Biotechnology Engineering · ' +
    'Universidad Católica del Maule</span><span class="grad">Graduated</span></li><li><strong' +
    '>Paulina Valenzuela</strong><span>Bioinformatics Engineering · Universidad de Talca</spa' +
    'n><span class="grad">Graduated</span></li></ul></section>',

  /* ── Tesis ─────────────────────────────────────────────── */
  // Los títulos de tesis no se traducen (idioma oficial); solo encabezados y programas.
  theses_h: 'Supervised and co-supervised theses',
  theses_sub: 'Theses completed in the last ten years. Titles are shown in their original language.',
  th_pg_h: 'Graduate',
  th_ug_h: 'Undergraduate',
  th_co_h: 'Undergraduate',
  th_role_dir: 'Thesis supervisor',
  th_role_guide: 'Supervisor',
  th_role_coguide: 'Co-supervisor',
  prog_bim_tit: 'Professional degree · Medical Bioengineering, UCM',
  prog_bim_lic: 'Bachelor\'s degree (Research Workshop II) · Medical Bioengineering, UCM',
  prog_biotec: 'Biotechnology Engineering, UCM',
  prog_bioinfo: 'Bioinformatics Engineering, Universidad de Talca',
  prog_mcc: 'MSc in Computer Science, UCM',
  prog_dbt: 'PhD in Translational Biotechnology, UCM',

  /* ── Proyectos ─────────────────────────────────────────── */
  s5_eyebrow: '05 — Projects',
  s5_title: 'Projects and funding',
  s5_sub:
    'Awarded projects, newest to oldest. Titles are shown in their official ' +
    'submission language.',
  // Los títulos oficiales NO se traducen: son citables tal cual fueron adjudicados.
  // Solo cambian el rol, el instrumento y la descripción.
  projects_list:
    '<article class="project"><div class="project-head"><span class="badge badge-lead">Direct' +
    'or</span><span class="project-years">2026 — 2030</span></div><h3>Disrupting Antibiotic R' +
    'esistance in <i>Pseudomonas aeruginosa</i>: Peptide Inhibitors Targeting the Assembly of' +
    ' the OprM protein with the MexAB, MexXY, MexCD and MexEF efflux pumps</h3><p class="proj' +
    'ect-role">Principal Investigator · ANID FONDECYT Regular</p><p> Rather than inhibiting e' +
    'ach efflux pump separately, we target the point where they all converge: assembly with t' +
    'he outer-membrane channel OprM. We design peptides that block that interface, dismantlin' +
    'g the whole system instead of a single pump. </p><ul class="tags subtle"><li><i>P. aerug' +
    'inosa</i></li><li>Peptides</li><li>Mex pumps</li></ul><div class="project-funder"><img c' +
    'lass="funder-logo" src="assets/img/anid.webp" alt="ANID — National Research and Developm' +
    'ent Agency" width="44" height="40" loading="lazy"><div class="funder-id"><span class="fu' +
    'nder-inst">FONDECYT Regular</span><span class="project-code">No. 1260886</span></div></d' +
    'iv></article><article class="project"><div class="project-head"><span class="badge badge' +
    '-coi">Co-investigator</span><span class="project-years">2025 — 2029</span></div><h3>Targ' +
    'eting ABC transporters with peptide-based strategies to combat hospital-acquired infecti' +
    'ons caused by <i>Staphylococcus aureus</i> and <i>Klebsiella pneumoniae</i></h3><p class' +
    '="project-role">Co-investigator · ANID FONDECYT Exploración</p><p> Extends the peptide s' +
    'trategy to the ABC transporters of two priority hospital pathogens, where resistance lea' +
    'ves ever fewer therapeutic options. </p><ul class="tags subtle"><li>ABC transporters</li' +
    '><li>Hospital-acquired infections</li></ul><div class="project-funder"><img class="funde' +
    'r-logo" src="assets/img/anid.webp" alt="ANID — National Research and Development Agency"' +
    ' width="44" height="40" loading="lazy"><div class="funder-id"><span class="funder-inst">' +
    'FONDECYT Exploración 2025</span></div></div></article><article class="project"><div clas' +
    's="project-head"><span class="badge badge-coi">Co-investigator</span><span class="projec' +
    't-years">2025 — 2029</span></div><h3>Integrated approach to optimal hormone application ' +
    'under drought and heat stress response in Strawberry plants and fruit quality determinat' +
    'ions</h3><p class="project-role">Co-investigator · ANID FONDECYT Regular</p><p> How to a' +
    'pply hormones optimally so strawberry withstands drought and heat stress without sacrifi' +
    'cing fruit quality — the agronomic counterpart of our ripening and aroma line. </p><ul c' +
    'lass="tags subtle"><li>Strawberry</li><li>Drought and heat stress</li></ul><div class="p' +
    'roject-funder"><img class="funder-logo" src="assets/img/anid.webp" alt="ANID — National ' +
    'Research and Development Agency" width="44" height="40" loading="lazy"><div class="funde' +
    'r-id"><span class="funder-inst">FONDECYT Regular</span><span class="project-code">No. 12' +
    '50346</span></div></div></article><article class="project"><div class="project-head"><sp' +
    'an class="badge badge-coi">Co-investigator</span><span class="project-years">2024 — 2028' +
    '</span></div><h3>Contributions to Control and Filter Design for Networked Cyber-Physical' +
    ' Systems: Theory and Applications</h3><p class="project-role">Co-investigator · ANID FON' +
    'DECYT Regular</p><p> Control theory and filter design for networked cyber-physical syste' +
    'ms, with applications that include medical pharmacokinetic systems. </p><ul class="tags ' +
    'subtle"><li>Cyber-physical systems</li><li>Control theory</li></ul><div class="project-f' +
    'under"><img class="funder-logo" src="assets/img/anid.webp" alt="ANID — National Research' +
    ' and Development Agency" width="44" height="40" loading="lazy"><div class="funder-id"><s' +
    'pan class="funder-inst">FONDECYT Regular</span><span class="project-code">No. 1241305</s' +
    'pan></div></div></article><article class="project"><div class="project-head"><span class' +
    '="badge badge-lead">Director</span><span class="project-years">2023</span></div><h3>Red ' +
    'de colaboración Chileno-Española-Brasileña para el diseño racional de fármacos y nanosis' +
    'temas de liberación controlada contra resistencia microbiana</h3><p class="project-role"' +
    '>Director · ANID International Cooperation (FOVI)</p><p> An international network linkin' +
    'g the lab\'s two axes — rational drug design and controlled-release nanosystems — agains' +
    't microbial resistance. </p><ul class="tags subtle"><li>International network</li><li>Na' +
    'nosystems</li></ul><div class="project-funder"><img class="funder-logo" src="assets/img/' +
    'anid.webp" alt="ANID — National Research and Development Agency" width="44" height="40" ' +
    'loading="lazy"><div class="funder-id"><span class="funder-inst">International Cooperatio' +
    'n</span><span class="project-code">No. FOVI230136</span></div></div></article><article c' +
    'lass="project"><div class="project-head"><span class="badge badge-lead">Director</span><' +
    'span class="project-years">2022 — 2025</span></div><h3>A robust theoretical and experime' +
    'ntal drug design strategy to discover new and highly potent urease inhibitors for <i>Hel' +
    'icobacter pylori</i> based on coumarin derivatives</h3><p class="project-role">Principal' +
    ' Investigator · ANID FONDECYT Iniciación</p><p> The project underpinning our urease line' +
    ': coumarin derivatives as a starting scaffold, combining computational design with exper' +
    'imental validation. </p><ul class="tags subtle"><li>Urease</li><li><i>H. pylori</i></li>' +
    '<li>Coumarins</li></ul><div class="project-funder"><img class="funder-logo" src="assets/' +
    'img/anid.webp" alt="ANID — National Research and Development Agency" width="44" height="' +
    '40" loading="lazy"><div class="funder-id"><span class="funder-inst">FONDECYT Iniciación<' +
    '/span><span class="project-code">No. 11220444</span></div></div></article><article class' +
    '="project"><div class="project-head"><span class="badge badge-lead">Director</span><span' +
    ' class="project-years">2022</span></div><h3>Subtractive genomics, drug repurposing and p' +
    'olypharmacology as a strategy to combat resistant <i>Pseudomonas aeruginosa</i> bacteria' +
    '</h3><p class="project-role">Director · UCM internal project</p><p> Subtractive genomics' +
    ' to narrow the proteome down to essential targets, and drug repurposing with a polypharm' +
    'acology approach against resistant <i>P. aeruginosa</i>. </p><ul class="tags subtle"><li' +
    '>Subtractive genomics</li><li>Drug repurposing</li></ul><div class="project-funder"><spa' +
    'n class="funder-text">UCM</span><div class="funder-id"><span class="funder-inst">UCM int' +
    'ernal funding</span><span class="project-code">No. UCM-IN22207</span></div></div></artic' +
    'le>',
  teaching_h: 'Teaching and service',
  teaching_list:
    '<article class="project"><div class="project-head">' +
    '<span class="badge badge-active">Study material</span>' +
    '<span class="project-years">3rd year · 2nd semester</span></div>' +
    '<h3><a href="BGM324/">BGM324 · Bioinformatics</a></h3>' +
    '<p class="project-role">Medical Bioengineering · Universidad Católica del Maule</p>' +
    '<p>Study material for five topics covered in the final units of the course: sequence ' +
    'alignment, protein structure prediction, molecular docking, computer-aided drug design and ' +
    'molecular dynamics.</p>' +
    '<p><a class="btn btn-ghost" href="BGM324/">View course material →</a></p></article>' +
    '<article class="project"><div class="project-head">' +
    '<span class="badge badge-coi">Complementary course</span>' +
    '<span class="project-years">6 documents</span></div>' +
    '<h3><a href="Bioinformatics-Complementary/">Bioinformatics - complementary course</a></h3>' +
    '<p class="project-role">Companion to BGM324 Bioinformatics · Curriculum Units 1–5</p>' +
    '<p>A self-study course that follows the official curriculum item by item: introduction and ' +
    'information theory, sequencing, databases and annotation, pairwise alignment and BLAST, ' +
    'multiple alignment and phylogenetics, and structural bioinformatics.</p>' +
    '<p><a class="btn btn-ghost" href="Bioinformatics-Complementary/">View material →</a></p></article>' +
    '<article class="project"><div class="project-head">' +
    '<span class="badge badge-active">Study material</span>' +
    '<span class="project-years">4th year · 1st semester</span></div>' +
    '<h3><a href="BGM411/">BGM411 · Artificial Intelligence</a></h3>' +
    '<p class="project-role">Medical Bioengineering · Universidad Católica del Maule</p>' +
    '<p>Nine units and two supplements as notebooks that run in Google Colab, in two equivalent ' +
    'editions, <strong>Python</strong> and <strong>R</strong>: supervised and unsupervised learning, ' +
    'neural networks, genetic algorithms and medical image classification.</p>' +
    '<p><a class="btn btn-ghost" href="BGM411/">View course material →</a></p></article>' +
    '<article class="project"><div class="project-head">' +
    '<span class="badge badge-coi">Supporting material</span>' +
    '<span class="project-years">19 notebooks</span></div>' +
    '<h3><a href="Cheminformatics/">Cheminformatics</a></h3>' +
    '<p class="project-role">Self-developed course · Cheminformatics for Computer Scientists</p>' +
    '<p>Ligand-based cheminformatics from scratch for students with a programming background: ' +
    'molecular representation, descriptors, similarity, QSAR, machine learning and generative ' +
    'design, with RDKit in Google Colab.</p>' +
    '<p><a class="btn btn-ghost" href="Cheminformatics/">View material →</a></p></article>' +
    '<article class="project"><div class="project-head">' +
    '<span class="badge badge-coi">Case study</span>' +
    '<span class="project-years">6 notebooks</span></div>' +
    '<h3><a href="Caso_Ureasa/">Provenance confounding in urease inhibitors</a></h3>' +
    '<p class="project-role">Supporting material · BGM324 Bioinformatics</p>' +
    '<p>A step-by-step reconstruction of a paper published by the group (' +
    '<a href="https://doi.org/10.3390/ijms27209159" target="_blank" rel="noopener">IJMS 2026, ' +
    'doi:10.3390/ijms27209159</a>) on ' +
    'provenance confounding in urease inhibitors, using its own data: validation, null models and ' +
    'conformal prediction.</p>' +
    '<p><a class="btn btn-ghost" href="Caso_Ureasa/">View material →</a></p></article>' +
    '<article class="project"><div class="project-head">' +
    '<span class="badge badge-active">Permanent</span></div>' +
    '<h3>Co-creation of the LBQC</h3>' +
    '<p class="project-role">Bioinformatics and Computational Chemistry Laboratory · UCM</p>' +
    '<p>Setting up the laboratory and its computing infrastructure for molecular modelling at ' +
    'the Faculty of Medicine.</p></article>',

  /* ── Contacto ──────────────────────────────────────────── */
  s6_eyebrow: '06 — Contact',
  s6_title: 'Contact',
  contact_p:
    'If you are interested in collaborating, doing your thesis in the lab, or asking about any ' +
    'of our work, write to me.',
  contact_email_l: 'Email',
  contact_addr_l: 'Address',
  contact_addr:
    'Faculty of Medicine, Universidad Católica del Maule<br>Av. San Miguel 3605, Talca, Chile',
  contact_profiles_h: 'Profiles',
  cf_title: 'Leave me a comment',
  cf_intro: 'Questions, suggestions or comments about the site or the course material. If you would like a reply, leave your email.',
  cf_name: 'Name (optional)',
  cf_email: 'Email (optional)',
  cf_msg: 'Comment',
  cf_send: 'Send comment',

  /* ── Pie ───────────────────────────────────────────────── */
  footer_copy:
    '© <span id="year">2026</span> Daniel Bustos · Bioinformatics and Computational Chemistry ' +
    'Laboratory, Universidad Católica del Maule.',
  footer_meta:
    'Bibliographic data via <a href="https://openalex.org" target="_blank" rel="noopener">OpenAlex</a>.'
};

/* ============================================================
   Textos que genera el JavaScript (no existen en el HTML), y
   metadatos de la página. Aquí sí van los dos idiomas.
   ============================================================ */
var I18N_UI = {
  es: {
    htmlLang: 'es',
    locale: 'es-CL',
    title: 'Daniel Bustos — Bioinformática Estructural',
    metaDesc: 'Daniel Bustos Guajardo, PhD. Bioinformática estructural, simulaciones de dinámica molecular y diseño de fármacos. Laboratorio de Bioinformática y Química Computacional (LBQC), Universidad Católica del Maule.',
    navLabel: 'Navegación principal',
    themeLabel: 'Cambiar tema',
    menuOpen: 'Abrir menú',
    menuClose: 'Cerrar menú',
    searchLabel: 'Buscar publicaciones',
    tablistLabel: 'Sistemas de estudio',
    tableCaption: 'Listado de publicaciones de Daniel Bustos',

    loading: 'Cargando publicaciones…',
    loadingMetrics: 'Cargando métricas…',
    liveStatus: function (n) { return 'Actualizado en vivo desde OpenAlex · ' + n + ' publicaciones.'; },
    localStatus: function (n, d) {
      return 'Mostrando la copia local (' + n + ' publicaciones'
           + (d ? ', generada el ' + d : '') + '). No se pudo consultar OpenAlex en vivo.';
    },
    loadError: 'No se pudieron cargar las publicaciones. Revisa tu conexión o abre la página desde un servidor local.',
    noData: 'Sin datos disponibles.',
    noMatch: 'Ningún resultado coincide con el filtro.',
    foot: function (shown, total, cites) {
      return 'Mostrando ' + shown + ' de ' + total + ' publicaciones · ' + cites + ' citas en la selección.';
    },
    metricsLive: function (d) { return 'Calculado en vivo desde OpenAlex · ' + d; },
    metricsLocal: function (d) { return 'Datos locales' + (d ? ' · ' + d : ''); },
    refEmpty: 'Ver la sección de publicaciones.',
    oaTitle: 'Acceso abierto',
    doi: 'DOI ↗',
    view: 'Ver ↗',
    types: {
      'article': 'Artículo',
      'preprint': 'Preprint',
      'conference-paper': 'Congreso',
      'conference-abstract': 'Resumen',
      'book': 'Libro',
      'book-chapter': 'Capítulo',
      'erratum': 'Corrección',
      'letter': 'Carta',
      'review': 'Revisión',
      'dataset': 'Dataset'
    }
  },
  en: {
    htmlLang: 'en',
    locale: 'en-GB',
    title: 'Daniel Bustos — Structural Bioinformatics',
    metaDesc: 'Daniel Bustos Guajardo, PhD. Structural bioinformatics, molecular dynamics simulations and drug design. Bioinformatics and Computational Chemistry Laboratory (LBQC), Universidad Católica del Maule.',
    navLabel: 'Main navigation',
    themeLabel: 'Toggle theme',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    searchLabel: 'Search publications',
    tablistLabel: 'Systems studied',
    tableCaption: 'List of publications by Daniel Bustos',

    loading: 'Loading publications…',
    loadingMetrics: 'Loading metrics…',
    liveStatus: function (n) { return 'Updated live from OpenAlex · ' + n + ' publications.'; },
    localStatus: function (n, d) {
      return 'Showing the local copy (' + n + ' publications'
           + (d ? ', generated on ' + d : '') + '). OpenAlex could not be reached live.';
    },
    loadError: 'Publications could not be loaded. Check your connection, or open the page from a local server.',
    noData: 'No data available.',
    noMatch: 'No results match the filter.',
    foot: function (shown, total, cites) {
      return 'Showing ' + shown + ' of ' + total + ' publications · ' + cites + ' citations in the selection.';
    },
    metricsLive: function (d) { return 'Computed live from OpenAlex · ' + d; },
    metricsLocal: function (d) { return 'Local data' + (d ? ' · ' + d : ''); },
    refEmpty: 'See the publications section.',
    oaTitle: 'Open access',
    doi: 'DOI ↗',
    view: 'View ↗',
    types: {
      'article': 'Article',
      'preprint': 'Preprint',
      'conference-paper': 'Conference',
      'conference-abstract': 'Abstract',
      'book': 'Book',
      'book-chapter': 'Chapter',
      'erratum': 'Correction',
      'letter': 'Letter',
      'review': 'Review',
      'dataset': 'Dataset'
    }
  }
};
