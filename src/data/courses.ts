import { Course } from '../App';

export const courses: Course[] = [
  {
    id: 'anatomy-101',
    title: 'Human Anatomy Fundamentals',
    description: 'Comprehensive study of human body structure and systems',
    image: 'https://images.unsplash.com/photo-1717066777721-f150e83d6c51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmF0b215JTIwc3R1ZHl8ZW58MXx8fHwxNzYyMzQ0NDI1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    instructor: 'Dr. Sarah Mitchell',
    duration: '12 weeks',
    modules: [
      {
        id: 'module-1',
        title: 'Introduction to Anatomy',
        description: 'Learn the basics of anatomical terminology and body organization',
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'Anatomical Terminology',
            type: 'video',
            duration: '25 min',
            content: '',
            description: 'Master the language of anatomy with directional terms and body planes',
          },
          {
            id: 'lesson-1-2',
            title: 'Body Organization',
            type: 'article',
            duration: '15 min read',
            content: `
              <h2>Levels of Structural Organization</h2>
              <p>The human body is organized at multiple levels, from simple to complex:</p>
              <h3>1. Chemical Level</h3>
              <p>Atoms combine to form molecules, which are the building blocks of all matter. Essential molecules in the body include water, proteins, carbohydrates, lipids, and nucleic acids.</p>
              <h3>2. Cellular Level</h3>
              <p>Molecules combine to form cells, the basic structural and functional units of life. Different types of cells perform specialized functions.</p>
              <h3>3. Tissue Level</h3>
              <p>Groups of similar cells working together form tissues. The four basic tissue types are:</p>
              <ul>
                <li><strong>Epithelial tissue</strong> - Covers body surfaces and lines cavities</li>
                <li><strong>Connective tissue</strong> - Supports and binds other tissues</li>
                <li><strong>Muscle tissue</strong> - Produces movement</li>
                <li><strong>Nervous tissue</strong> - Transmits electrical signals</li>
              </ul>
              <h3>4. Organ Level</h3>
              <p>Different tissues combine to form organs, which perform specific functions. Examples include the heart, lungs, liver, and brain.</p>
              <h3>5. Organ System Level</h3>
              <p>Related organs work together to perform complex functions. Major organ systems include cardiovascular, respiratory, digestive, and nervous systems.</p>
              <h3>6. Organismal Level</h3>
              <p>All organ systems work together to maintain life and homeostasis in the complete organism.</p>
            `,
            description: 'Understand the hierarchical organization of the human body',
          },
          {
            id: 'lesson-1-3',
            title: 'Body Cavities and Membranes',
            type: 'video',
            duration: '20 min',
            content: '',
            description: 'Explore the major body cavities and their protective membranes',
          },
        ],
        quiz: {
          id: 'quiz-1',
          passingScore: 80,
          questions: [
            {
              id: 'q1-1',
              question: 'Which anatomical term describes a position closer to the head?',
              options: ['Inferior', 'Superior', 'Medial', 'Lateral'],
              correctAnswer: 1,
              explanation: 'Superior means toward the head or upper part of a structure. Inferior means away from the head or toward the lower part.',
            },
            {
              id: 'q1-2',
              question: 'What is the basic unit of life in the human body?',
              options: ['Atom', 'Cell', 'Tissue', 'Organ'],
              correctAnswer: 1,
              explanation: 'The cell is the basic structural and functional unit of life. All living organisms are composed of one or more cells.',
            },
            {
              id: 'q1-3',
              question: 'Which tissue type is responsible for transmitting electrical signals?',
              options: ['Epithelial', 'Connective', 'Muscle', 'Nervous'],
              correctAnswer: 3,
              explanation: 'Nervous tissue is specialized for communication through electrical and chemical signals.',
            },
            {
              id: 'q1-4',
              question: 'What plane divides the body into left and right halves?',
              options: ['Transverse', 'Frontal', 'Sagittal', 'Oblique'],
              correctAnswer: 2,
              explanation: 'The sagittal plane divides the body into left and right portions. A midsagittal plane divides it into equal left and right halves.',
            },
            {
              id: 'q1-5',
              question: 'Which level of organization comes immediately after the cellular level?',
              options: ['Chemical', 'Tissue', 'Organ', 'System'],
              correctAnswer: 1,
              explanation: 'The tissue level follows the cellular level. Tissues are groups of similar cells working together to perform specific functions.',
            },
          ],
        },
      },
      {
        id: 'module-2',
        title: 'Skeletal System',
        description: 'Study the bones, joints, and their functions in the human body',
        lessons: [
          {
            id: 'lesson-2-1',
            title: 'Bone Structure and Function',
            type: 'video',
            duration: '30 min',
            content: '',
            description: 'Learn about bone composition, types, and physiological functions',
          },
          {
            id: 'lesson-2-2',
            title: 'The Axial Skeleton',
            type: 'article',
            duration: '20 min read',
            content: `
              <h2>The Axial Skeleton</h2>
              <p>The axial skeleton forms the central axis of the body and consists of 80 bones.</p>
              <h3>Components:</h3>
              <ul>
                <li><strong>Skull (22 bones)</strong> - Protects the brain and forms the face</li>
                <li><strong>Vertebral Column (26 bones)</strong> - Protects the spinal cord and supports the trunk</li>
                <li><strong>Thoracic Cage (25 bones)</strong> - Protects thoracic organs and assists in breathing</li>
              </ul>
            `,
            description: 'Detailed examination of the skull, vertebral column, and ribcage',
          },
          {
            id: 'lesson-2-3',
            title: 'Joints and Movement',
            type: 'video',
            duration: '25 min',
            content: '',
            description: 'Understand different joint types and their ranges of motion',
          },
        ],
        quiz: {
          id: 'quiz-2',
          passingScore: 75,
          questions: [
            {
              id: 'q2-1',
              question: 'How many bones are in the adult human body?',
              options: ['186', '206', '226', '246'],
              correctAnswer: 1,
              explanation: 'The adult human skeleton contains 206 bones. Babies are born with approximately 270 bones, which fuse together as they grow.',
            },
            {
              id: 'q2-2',
              question: 'Which type of bone cell is responsible for bone formation?',
              options: ['Osteoclasts', 'Osteoblasts', 'Osteocytes', 'Chondrocytes'],
              correctAnswer: 1,
              explanation: 'Osteoblasts are bone-forming cells that synthesize and secrete the bone matrix.',
            },
            {
              id: 'q2-3',
              question: 'What is the longest bone in the human body?',
              options: ['Tibia', 'Humerus', 'Femur', 'Radius'],
              correctAnswer: 2,
              explanation: 'The femur (thighbone) is the longest and strongest bone in the human body.',
            },
            {
              id: 'q2-4',
              question: 'Which joint type allows the greatest range of motion?',
              options: ['Hinge', 'Pivot', 'Ball-and-socket', 'Gliding'],
              correctAnswer: 2,
              explanation: 'Ball-and-socket joints (like the shoulder and hip) allow movement in all planes and rotation.',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'cardiology-advanced',
    title: 'Advanced Cardiology',
    description: 'In-depth study of cardiovascular system and cardiac pathophysiology',
    image: 'https://images.unsplash.com/photo-1618939304347-e91b1f33d2ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJkaW9sb2d5JTIwaGVhcnR8ZW58MXx8fHwxNzYyMzQ0NDI1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    instructor: 'Dr. Michael Chen',
    duration: '16 weeks',
    modules: [
      {
        id: 'module-c1',
        title: 'Cardiac Anatomy and Physiology',
        description: 'Comprehensive overview of heart structure and function',
        lessons: [
          {
            id: 'lesson-c1-1',
            title: 'Heart Chambers and Valves',
            type: 'video',
            duration: '35 min',
            content: '',
            description: 'Detailed study of cardiac chambers, valves, and blood flow pathways',
          },
          {
            id: 'lesson-c1-2',
            title: 'Cardiac Conduction System',
            type: 'article',
            duration: '25 min read',
            content: `
              <h2>The Cardiac Conduction System</h2>
              <p>The heart's electrical conduction system controls the heart rhythm and coordinates contractions.</p>
              <h3>Components:</h3>
              <ol>
                <li><strong>Sinoatrial (SA) Node</strong> - The heart's natural pacemaker, located in the right atrium</li>
                <li><strong>Atrioventricular (AV) Node</strong> - Delays electrical impulses to allow atrial contraction</li>
                <li><strong>Bundle of His</strong> - Transmits impulses from AV node to ventricles</li>
                <li><strong>Bundle Branches</strong> - Right and left branches distribute impulses</li>
                <li><strong>Purkinje Fibers</strong> - Rapidly distribute impulses throughout ventricles</li>
              </ol>
            `,
            description: 'Learn how electrical signals coordinate heart contractions',
          },
          {
            id: 'lesson-c1-3',
            title: 'Cardiac Cycle and Hemodynamics',
            type: 'video',
            duration: '30 min',
            content: '',
            description: 'Understanding systole, diastole, and blood pressure regulation',
          },
        ],
        quiz: {
          id: 'quiz-c1',
          passingScore: 80,
          questions: [
            {
              id: 'qc1-1',
              question: 'Which chamber of the heart receives oxygenated blood from the lungs?',
              options: ['Right atrium', 'Left atrium', 'Right ventricle', 'Left ventricle'],
              correctAnswer: 1,
              explanation: 'The left atrium receives oxygenated blood from the pulmonary veins returning from the lungs.',
            },
            {
              id: 'qc1-2',
              question: 'What is the typical heart rate generated by the SA node?',
              options: ['40-60 bpm', '60-100 bpm', '100-120 bpm', '120-140 bpm'],
              correctAnswer: 1,
              explanation: 'The SA node normally fires at a rate of 60-100 beats per minute in a resting adult.',
            },
            {
              id: 'qc1-3',
              question: 'Which valve prevents backflow from the aorta into the left ventricle?',
              options: ['Mitral valve', 'Tricuspid valve', 'Pulmonary valve', 'Aortic valve'],
              correctAnswer: 3,
              explanation: 'The aortic valve is located between the left ventricle and aorta, preventing regurgitation during diastole.',
            },
            {
              id: 'qc1-4',
              question: 'During which phase does ventricular filling occur?',
              options: ['Systole', 'Diastole', 'Isovolumetric contraction', 'Ejection'],
              correctAnswer: 1,
              explanation: 'Ventricular filling occurs during diastole when the ventricles are relaxed and the AV valves are open.',
            },
            {
              id: 'qc1-5',
              question: 'What is the medical term for the contraction phase of the cardiac cycle?',
              options: ['Diastole', 'Systole', 'Repolarization', 'Depolarization'],
              correctAnswer: 1,
              explanation: 'Systole refers to the contraction phase when the heart chambers pump blood. Diastole is the relaxation phase.',
            },
          ],
        },
      },
      {
        id: 'module-c2',
        title: 'Common Cardiac Pathologies',
        description: 'Study major cardiovascular diseases and their mechanisms',
        lessons: [
          {
            id: 'lesson-c2-1',
            title: 'Coronary Artery Disease',
            type: 'video',
            duration: '40 min',
            content: '',
            description: 'Pathophysiology of atherosclerosis and myocardial ischemia',
          },
          {
            id: 'lesson-c2-2',
            title: 'Heart Failure Overview',
            type: 'article',
            duration: '30 min read',
            content: `
              <h2>Heart Failure</h2>
              <p>Heart failure is a chronic condition where the heart cannot pump sufficient blood to meet the body's needs.</p>
              <h3>Classifications:</h3>
              <ul>
                <li><strong>Left-sided failure</strong> - Most common, leads to pulmonary congestion</li>
                <li><strong>Right-sided failure</strong> - Causes systemic venous congestion</li>
                <li><strong>Systolic failure</strong> - Reduced ejection fraction (HFrEF)</li>
                <li><strong>Diastolic failure</strong> - Preserved ejection fraction (HFpEF)</li>
              </ul>
            `,
            description: 'Classification, pathophysiology, and clinical manifestations',
          },
          {
            id: 'lesson-c2-3',
            title: 'Arrhythmias and ECG Interpretation',
            type: 'video',
            duration: '45 min',
            content: '',
            description: 'Common cardiac arrhythmias and electrocardiogram analysis',
          },
        ],
        quiz: {
          id: 'quiz-c2',
          passingScore: 75,
          questions: [
            {
              id: 'qc2-1',
              question: 'What is the primary cause of coronary artery disease?',
              options: ['Hypertension', 'Atherosclerosis', 'Diabetes', 'Smoking'],
              correctAnswer: 1,
              explanation: 'Atherosclerosis, the buildup of plaque in arterial walls, is the primary underlying cause of coronary artery disease.',
            },
            {
              id: 'qc2-2',
              question: 'Which medication class is commonly used as first-line treatment for heart failure?',
              options: ['Antibiotics', 'ACE inhibitors', 'Antihistamines', 'NSAIDs'],
              correctAnswer: 1,
              explanation: 'ACE inhibitors are cornerstone medications for heart failure, reducing afterload and preventing cardiac remodeling.',
            },
            {
              id: 'qc2-3',
              question: 'What does the QRS complex on an ECG represent?',
              options: ['Atrial depolarization', 'Ventricular depolarization', 'Atrial repolarization', 'Ventricular repolarization'],
              correctAnswer: 1,
              explanation: 'The QRS complex represents ventricular depolarization, which triggers ventricular contraction.',
            },
            {
              id: 'qc2-4',
              question: 'Which arrhythmia is characterized by an irregularly irregular rhythm?',
              options: ['Sinus bradycardia', 'Atrial fibrillation', 'First-degree AV block', 'Sinus tachycardia'],
              correctAnswer: 1,
              explanation: 'Atrial fibrillation produces an irregularly irregular ventricular rhythm with no consistent pattern.',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'pharmacology-essentials',
    title: 'Clinical Pharmacology Essentials',
    description: 'Essential principles of drug action, metabolism, and therapeutics',
    image: 'https://images.unsplash.com/photo-1545840716-c82e9eec6930?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaGFybWFjb2xvZ3klMjBtZWRpY2luZXxlbnwxfHx8fDE3NjIzNDQ0MjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    instructor: 'Dr. Emily Rodriguez',
    duration: '14 weeks',
    modules: [
      {
        id: 'module-p1',
        title: 'Pharmacokinetics and Pharmacodynamics',
        description: 'How drugs move through the body and produce their effects',
        lessons: [
          {
            id: 'lesson-p1-1',
            title: 'ADME: Drug Absorption and Distribution',
            type: 'video',
            duration: '28 min',
            content: '',
            description: 'Understanding absorption routes and distribution mechanisms',
          },
          {
            id: 'lesson-p1-2',
            title: 'Drug Metabolism and Excretion',
            type: 'article',
            duration: '22 min read',
            content: `
              <h2>Drug Metabolism and Excretion</h2>
              <h3>Metabolism (Biotransformation)</h3>
              <p>Most drugs are metabolized primarily in the liver through two phases:</p>
              <ul>
                <li><strong>Phase I reactions</strong> - Oxidation, reduction, hydrolysis (mainly via cytochrome P450 enzymes)</li>
                <li><strong>Phase II reactions</strong> - Conjugation reactions that increase water solubility</li>
              </ul>
              <h3>Excretion</h3>
              <p>Primary routes of drug elimination:</p>
              <ul>
                <li><strong>Renal excretion</strong> - Most common route via kidneys</li>
                <li><strong>Biliary excretion</strong> - Through bile into feces</li>
                <li><strong>Other routes</strong> - Lungs, sweat, saliva, breast milk</li>
              </ul>
            `,
            description: 'Learn how the body processes and eliminates drugs',
          },
          {
            id: 'lesson-p1-3',
            title: 'Pharmacodynamics: Drug-Receptor Interactions',
            type: 'video',
            duration: '32 min',
            content: '',
            description: 'Mechanisms of drug action and receptor theory',
          },
        ],
        quiz: {
          id: 'quiz-p1',
          passingScore: 80,
          questions: [
            {
              id: 'qp1-1',
              question: 'Which route of administration provides 100% bioavailability?',
              options: ['Oral', 'Intravenous', 'Subcutaneous', 'Intramuscular'],
              correctAnswer: 1,
              explanation: 'Intravenous administration bypasses absorption barriers, providing 100% bioavailability as the drug enters directly into circulation.',
            },
            {
              id: 'qp1-2',
              question: 'What does the term "first-pass metabolism" refer to?',
              options: ['Renal clearance', 'Hepatic metabolism before systemic circulation', 'Drug absorption in the stomach', 'Protein binding'],
              correctAnswer: 1,
              explanation: 'First-pass metabolism occurs when orally administered drugs are metabolized by the liver before reaching systemic circulation.',
            },
            {
              id: 'qp1-3',
              question: 'Which enzyme family is primarily responsible for Phase I drug metabolism?',
              options: ['Cytochrome P450', 'Glucuronyl transferase', 'Sulfotransferase', 'Esterases'],
              correctAnswer: 0,
              explanation: 'The cytochrome P450 (CYP) enzyme family is responsible for most Phase I oxidative metabolism reactions.',
            },
            {
              id: 'qp1-4',
              question: 'What is the primary organ for drug excretion?',
              options: ['Liver', 'Kidneys', 'Lungs', 'Skin'],
              correctAnswer: 1,
              explanation: 'The kidneys are the primary organs for drug excretion, filtering drugs and metabolites from blood into urine.',
            },
            {
              id: 'qp1-5',
              question: 'What type of drug-receptor interaction produces a biological response?',
              options: ['Antagonist', 'Agonist', 'Inverse agonist', 'Partial antagonist'],
              correctAnswer: 1,
              explanation: 'An agonist binds to and activates receptors, producing a biological response similar to the endogenous ligand.',
            },
          ],
        },
      },
    ],
  },
];
