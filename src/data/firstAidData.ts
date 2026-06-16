export interface FirstAidStep {
  text: string;
  substeps?: string[];
}

export interface FirstAidArticle {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'MODERATE' | 'MILD';
  bodyParts: string[];
  tags: string[];
  immediateActions: string[];
  steps: FirstAidStep[];
  warnings: string[];
  sources: string[];
  timerType?: 'cpr' | 'bleeding' | 'eyeflush' | 'none';
}

export const firstAidDataset: FirstAidArticle[] = [
  {
    id: 'cardiac-arrest',
    title: 'Heart Attack & Cardiac Arrest',
    description: 'Sudden stoppage of heart function, or severe chest discomfort indicating a heart attack. Time-critical emergency.',
    severity: 'CRITICAL',
    bodyParts: ['chest', 'upper_back'],
    tags: ['cpr', 'heart attack', 'chest pain', 'cardiac arrest', 'unconscious', 'no breathing', 'pulse'],
    immediateActions: [
      'Call emergency services (911 / 112) immediately.',
      'Get an AED (Automated External Defibrillator) if available.',
      'Check if the person is responsive and breathing.'
    ],
    timerType: 'cpr',
    steps: [
      {
        text: 'Check responsiveness and breathing',
        substeps: [
          'Tap the person on the shoulder and shout, "Are you okay?"',
          'Look at their chest to see if it is rising and falling (no more than 10 seconds).'
        ]
      },
      {
        text: 'Start CPR if unresponsive and not breathing (or only gasping)',
        substeps: [
          'Place the heel of one hand in the center of the chest (between nipples).',
          'Place your other hand on top and interlock your fingers.',
          'Position your shoulders directly over your hands, lock your elbows, and push straight down.',
          'Push hard and fast: at least 2 inches (5 cm) deep, at a rate of 100 to 120 compressions per minute.',
          'Let the chest rise completely after each compression.'
        ]
      },
      {
        text: 'Provide rescue breaths (if trained)',
        substeps: [
          'After 30 compressions, tilt the head back and lift the chin.',
          'Pinch the nose shut and give 2 rescue breaths (about 1 second each), watching for the chest to rise.',
          'If untrained or uncomfortable, perform hands-only CPR (continuous compressions).'
        ]
      },
      {
        text: 'Use the AED as soon as it arrives',
        substeps: [
          'Turn on the AED and follow the voice prompts.',
          'Apply the pads to the bare chest as shown in the AED diagrams.',
          'Make sure no one is touching the person if the AED analyses the rhythm or delivers a shock.'
        ]
      }
    ],
    warnings: [
      'Do not stop CPR until emergency services arrive, an AED is ready to use, or the person starts breathing.',
      'Do not give rescue breaths if you are not trained; perform continuous hands-only chest compressions instead.',
      'Do not place AED pads directly over a pacemaker or medication patch.'
    ],
    sources: [
      'American Heart Association (AHA) CPR & ECC Guidelines',
      'Red Cross CPR/AED Handbook'
    ]
  },
  {
    id: 'choking',
    title: 'Choking (Heimlich Maneuver)',
    description: 'Airway obstruction causing inability to breathe, speak, or cough effectively.',
    severity: 'CRITICAL',
    bodyParts: ['neck', 'chest', 'abdomen'],
    tags: ['choking', 'heimlich', 'coughing', 'blocked airway', 'throat'],
    immediateActions: [
      'Ask the person, "Are you choking?" Verify if they can speak or cough.',
      'If they cannot speak or breathe, yell for someone to call 911 / 112 and prepare to act.'
    ],
    timerType: 'none',
    steps: [
      {
        text: 'Give 5 back blows',
        substeps: [
          'Stand to the side and slightly behind the choking person.',
          'Support their chest with one hand and lean them forward so the object can exit.',
          'Deliver 5 firm blows between their shoulder blades using the heel of your hand.'
        ]
      },
      {
        text: 'Give 5 abdominal thrusts (Heimlich Maneuver)',
        substeps: [
          'Stand behind the person. Wrap your arms around their waist.',
          'Make a fist with one hand and place it just above the navel (belly button) and well below the breastbone.',
          'Grasp the fist with your other hand.',
          'Press hard into the abdomen with a quick, upward thrust.',
          'Repeat up to 5 times. Alternate between 5 back blows and 5 abdominal thrusts.'
        ]
      },
      {
        text: 'If the person becomes unconscious',
        substeps: [
          'Lower them carefully to the ground.',
          'Call 911 / 112 if not already done.',
          'Begin CPR (30 chest compressions). Before giving breaths, open the mouth and look for the object. If visible, sweep it out with your finger. Do NOT do blind finger sweeps.'
        ]
      }
    ],
    warnings: [
      'Do not perform abdominal thrusts on a pregnant woman or an infant (use chest thrusts/back blows instead).',
      'Do not do blind finger sweeps, as you might push the object further down the airway.'
    ],
    sources: [
      'Mayo Clinic First Aid Guidelines',
      'American Red Cross First Aid/CPR/AED Manual'
    ]
  },
  {
    id: 'severe-bleeding',
    title: 'Severe Bleeding & Deep Cuts',
    description: 'Rapid, heavy blood loss from a wound. Can lead to shock and death if not controlled quickly.',
    severity: 'CRITICAL',
    bodyParts: ['arms', 'hands', 'legs', 'feet', 'abdomen', 'chest', 'pelvis', 'shoulders'],
    tags: ['bleeding', 'cut', 'knife cut', 'wound', 'hemorrhage', 'blood', 'gash', 'laceration'],
    immediateActions: [
      'Put on protective gloves if available.',
      'Call emergency services (911 / 112) if the bleeding is spurting, will not stop, or the wound is deep.'
    ],
    timerType: 'bleeding',
    steps: [
      {
        text: 'Apply direct pressure',
        substeps: [
          'Place a sterile dressing or clean cloth firmly over the wound.',
          'Apply constant, firm pressure with both hands directly on the wound.',
          'Maintain pressure for at least 10 minutes without lifting the cloth to check (use the bleeding timer).'
        ]
      },
      {
        text: 'Elevate the limb',
        substeps: [
          'If the wound is on a limb (arm or leg), raise it above the level of the heart to help slow blood flow, while maintaining firm pressure.'
        ]
      },
      {
        text: 'Apply a pressure bandage',
        substeps: [
          'If bleeding slows, wrap a bandage firmly over the dressing to hold it in place.',
          'Do not wrap it so tight that it cuts off circulation (check for warmth and pulse below the bandage).'
        ]
      },
      {
        text: 'If bleeding does not stop (Use Tourniquet if available)',
        substeps: [
          'For severe, life-threatening limb bleeding, apply a commercial tourniquet 2-3 inches above the wound (never directly over a joint).',
          'Tighten it until bleeding stops. Note the exact time the tourniquet was applied.'
        ]
      }
    ],
    warnings: [
      'Do not remove the blood-soaked dressings. If blood seeps through, place another clean dressing directly over the first one and keep applying pressure.',
      'Do not wash out a deeply bleeding or dirty large wound, as this can wash away clotting factors and restart bleeding.',
      'Do not apply a tourniquet unless the bleeding is life-threatening and cannot be stopped by direct pressure.'
    ],
    sources: [
      'Stop The Bleed Campaign Guidelines (American College of Surgeons)',
      'World Health Organization (WHO) Basic First Aid'
    ]
  },
  {
    id: 'chemical-eye-burn',
    title: 'Chemical Eye Burn / Splash',
    description: 'Chemical exposure in the eyes, which can cause permanent blindness. Emergency flushing is required immediately.',
    severity: 'CRITICAL',
    bodyParts: ['head'],
    tags: ['eye', 'burn', 'chemical', 'acid', 'alkali', 'blindness', 'splash', 'rinse'],
    immediateActions: [
      'Immediately begin flushing the eye with clean, lukewarm water.',
      'Have someone call emergency services (911 / 112) or Poison Control while you wash.'
    ],
    timerType: 'eyeflush',
    steps: [
      {
        text: 'Flush the eye continuously',
        substeps: [
          'Hold the eyelids open with your fingers.',
          'Run a gentle stream of lukewarm, clean water over the eye.',
          'Flush from the inner corner of the eye near the nose outward, so the chemical doesn\'t wash into the unaffected eye.',
          'Continue flushing for at least 15 to 20 minutes (use the eye flush timer).'
        ]
      },
      {
        text: 'Remove contact lenses',
        substeps: [
          'If the person wears contact lenses, gently remove them during the flushing process if they haven\'t washed out already.'
        ]
      },
      {
        text: 'Bandage the eye gently',
        substeps: [
          'After thorough flushing, loosely cover the eye with a clean, sterile dressing.',
          'Do not apply pressure to the eyeball.'
        ]
      }
    ],
    warnings: [
      'Do not rub the eye, as this can cause further scratch damage and press chemicals deeper.',
      'Do not use any eye drops, neutralizing agents, or ointments unless instructed by a medical professional.',
      'Do not delay flushing to search for a clean eye-wash kit; tap water is preferred over waiting.'
    ],
    sources: [
      'American Academy of Ophthalmology',
      'Mayo Clinic First Aid for Eye Chemical Splashes'
    ]
  },
  {
    id: 'stroke',
    title: 'Stroke (Brain Attack)',
    description: 'Disruption of blood flow to the brain, causing sudden neurological deficits. Minutes save brain cells.',
    severity: 'CRITICAL',
    bodyParts: ['head'],
    tags: ['stroke', 'brain', 'face drop', 'speech', 'arm weakness', 'clot', 'aneurysm'],
    immediateActions: [
      'Note the exact time symptoms started.',
      'Call emergency services (911 / 112) immediately and state: "I suspect a stroke."'
    ],
    timerType: 'none',
    steps: [
      {
        text: 'Perform the F.A.S.T. Assessment',
        substeps: [
          'F - Face Drooping: Ask the person to smile. Does one side of the face droop?',
          'A - Arm Weakness: Ask the person to raise both arms. Does one arm drift downward?',
          'S - Speech Difficulty: Ask the person to repeat a simple sentence. Is their speech slurred or strange?',
          'T - Time to call: If the person shows any of these signs, even if they go away, call emergency services immediately.'
        ]
      },
      {
        text: 'Keep the person comfortable and safe',
        substeps: [
          'Help the person lie down on their side with their head slightly elevated if they are conscious.',
          'Loosen any tight clothing.',
          'Monitor their breathing and responsiveness closely. Prepare to start CPR if they stop breathing.'
        ]
      }
    ],
    warnings: [
      'Do not give the person aspirin, food, or drink, as a stroke can impair swallowing and lead to choking. If the stroke is hemorrhagic (bleeding), aspirin will make it worse.',
      'Do not let the person sleep or drive themselves to the hospital.'
    ],
    sources: [
      'American Stroke Association (ASA) Guidelines',
      'CDC Stroke Signs and Prevention'
    ]
  },
  {
    id: 'burns',
    title: 'Thermal Burns (Heat/Fire)',
    description: 'Skin damage caused by heat, fire, steam, or hot liquids. Treatment depends on severity.',
    severity: 'MODERATE',
    bodyParts: ['arms', 'hands', 'legs', 'feet', 'abdomen', 'chest', 'head', 'pelvis', 'shoulders', 'upper_back', 'lower_back', 'neck'],
    tags: ['burn', 'burning', 'fire', 'scald', 'blister', 'heat', 'skin'],
    immediateActions: [
      'Move the person away from the heat source.',
      'If the burn is large, deep, or on the face, hands, feet, groin, or major joints, call 911 / 112.'
    ],
    timerType: 'none',
    steps: [
      {
        text: 'Cool the burn',
        substeps: [
          'Hold the burned area under cool (not cold) running water for 10 to 20 minutes.',
          'If running water is unavailable, apply a clean, cool, damp compress.'
        ]
      },
      {
        text: 'Remove restrictive items',
        substeps: [
          'Gently remove rings, bracelets, or tight clothing from the burned area before it starts to swell.'
        ]
      },
      {
        text: 'Apply a clean dressing',
        substeps: [
          'Cover the burn loosely with a sterile, non-stick gauze bandage.',
          'Keep it loose to avoid putting pressure on the burned skin.'
        ]
      },
      {
        text: 'Manage pain',
        substeps: [
          'Over-the-counter pain relievers (e.g., ibuprofen, acetaminophen) can help reduce pain and swelling.'
        ]
      }
    ],
    warnings: [
      'Do not use ice, ice water, butter, oils, toothpaste, or ointments on the burn. Ice can cause frostbite damage, and oils trap heat, worsening the burn.',
      'Do not break blisters. Intact blisters provide a sterile barrier against infection.',
      'Do not remove clothing that is stuck to the burn.'
    ],
    sources: [
      'Mayo Clinic Burns Treatment Guide',
      'World Health Organization (WHO) Burn Prevention and Care'
    ]
  },
  {
    id: 'concussion-head-injury',
    title: 'Concussion & Head Injury',
    description: 'Trauma to the head from an impact, fall, or blast. Can range from a mild concussion to a severe brain injury.',
    severity: 'MODERATE',
    bodyParts: ['head'],
    tags: ['concussion', 'head injury', 'fall', 'dizzy', 'unconscious', 'trauma', 'skull'],
    immediateActions: [
      'Keep the person still. Support their head and neck to prevent movement in case of spinal injury.',
      'Call 911 / 112 immediately if there is a loss of consciousness, repeated vomiting, seizures, worsening headache, or fluid leaking from the nose/ears.'
    ],
    timerType: 'none',
    steps: [
      {
        text: 'Control minor bleeding',
        substeps: [
          'If there is a cut, apply gentle pressure with a clean cloth. If you suspect a skull fracture, apply pressure *around* the wound edge, not directly over it.'
        ]
      },
      {
        text: 'Assess symptoms of concussion',
        substeps: [
          'Look for physical signs: Dizziness, nausea, vomiting, balance problems, dilated or unequal pupils, headache.',
          'Look for cognitive signs: Confusion, memory loss (e.g., not knowing what happened), slurred speech, drowsiness.'
        ]
      },
      {
        text: 'Monitor responsiveness',
        substeps: [
          'Stay with the person. Keep checking their breathing and pulse.',
          'Ask simple questions periodically to ensure they remain alert.'
        ]
      }
    ],
    warnings: [
      'Do not move the person unless they are in immediate danger. Treat them as if they have a spinal injury.',
      'Do not allow the person to return to physical activity or sports until cleared by a doctor.',
      'Do not give them aspirin or other blood-thinning pain relievers, which can increase bleeding in the brain.'
    ],
    sources: [
      'CDC Heads Up Concussion Program',
      'American Association of Neurological Surgeons'
    ]
  },
  {
    id: 'fractures-sprains',
    title: 'Fractures & Joint Sprains',
    description: 'Broken bones or stretched/torn ligaments. Requires immobilization and swelling control.',
    severity: 'MODERATE',
    bodyParts: ['arms', 'hands', 'legs', 'feet', 'shoulders'],
    tags: ['fracture', 'sprain', 'bone', 'broken bone', 'joint', 'twist', 'swelling', 'fall', 'ankle', 'wrist'],
    immediateActions: [
      'If a bone is protruding through the skin (open fracture), call 911 / 112 and cover the wound with a clean dressing. Do not attempt to push the bone back.',
      'Do not move the injured limb.'
    ],
    timerType: 'none',
    steps: [
      {
        text: 'Immobilize the area',
        substeps: [
          'Keep the injured limb still. If possible, apply a splint to the joint above and below the injury.',
          'You can use rolled-up newspapers, boards, or folded blankets secured with tape or cloth. Do not tie too tightly.'
        ]
      },
      {
        text: 'Apply the R.I.C.E. protocol for sprains',
        substeps: [
          'R - Rest: Keep the injured limb supported and avoid putting weight on it.',
          'I - Ice: Apply a cold pack wrapped in a cloth for 15-20 minutes at a time to reduce swelling.',
          'C - Compression: Wrap the area with an elastic bandage firmly, but not so tight that it stops blood flow.',
          'E - Elevation: Prop the injured limb up so it rests above the level of the heart.'
        ]
      }
    ],
    warnings: [
      'Do not try to align or straighten a deformed limb or force a joint back into place.',
      'Do not apply ice directly to the skin; always wrap it in a towel or cloth.',
      'Do not let the person walk on a suspected fractured leg or ankle.'
    ],
    sources: [
      'American Academy of Orthopaedic Surgeons',
      'Mayo Clinic First Aid for Fractures'
    ]
  },
  {
    id: 'poisoning',
    title: 'Poisoning & Chemical Ingestion',
    description: 'Ingestion, inhalation, or skin contact with a toxic substance.',
    severity: 'CRITICAL',
    bodyParts: ['abdomen', 'neck', 'head', 'pelvis', 'lower_back'],
    tags: ['poison', 'chemical', 'toxic', 'ingestion', 'pill', 'swallow', 'vomit', 'acid', 'poison control'],
    immediateActions: [
      'If the person is unconscious, having seizures, or difficulty breathing, call 911 / 112 immediately.',
      'If they are conscious and stable, call Poison Control immediately (US: 1-800-222-1222).'
    ],
    timerType: 'none',
    steps: [
      {
        text: 'Identify the poison',
        substeps: [
          'Quickly find the container or substance. Note the name, ingredients, and approximate amount ingested or touched.',
          'Note the time of the exposure.'
        ]
      },
      {
        text: 'Inhaled poisons',
        substeps: [
          'Immediately move the person to fresh air. Avoid inhaling toxic fumes yourself.'
        ]
      },
      {
        text: 'Poisons on skin/eyes',
        substeps: [
          'Remove contaminated clothing.',
          'Flush skin or eyes with large amounts of running water for 15-20 minutes.'
        ]
      },
      {
        text: 'Swallowed poisons',
        substeps: [
          'If the person is conscious, follow instructions from the Poison Control specialist. Do NOT administer anything by mouth unless advised.'
        ]
      }
    ],
    warnings: [
      'Do not induce vomiting unless specifically instructed to do so by a Poison Control specialist or medical professional. Corrosive substances (like bleach or acids) will cause double burns to the esophagus if vomited.',
      'Do not give syrup of ipecac or charcoal unless instructed.'
    ],
    sources: [
      'American Association of Poison Control Centers (AAPCC)',
      'HRSA Poison Help'
    ]
  },
  {
    id: 'snake-bite',
    title: 'Snake Bites (Venomous)',
    description: 'Bite from a venomous snake. Requires immediate medical intervention to administer antivenom.',
    severity: 'CRITICAL',
    bodyParts: ['arms', 'hands', 'legs', 'feet', 'pelvis'],
    tags: ['snake', 'bite', 'venom', 'viper', 'cobra', 'fang', 'swelling', 'puncture'],
    immediateActions: [
      'Call emergency services (911 / 112) immediately.',
      'Keep the person completely calm and still. Movement spreads the venom faster.'
    ],
    timerType: 'none',
    steps: [
      {
        text: 'Immobilize the bitten limb',
        substeps: [
          'Keep the bitten limb below the level of the heart.',
          'Splint the limb loosely to prevent movement, but do not compress it.'
        ]
      },
      {
        text: 'Clean the bite site gently',
        substeps: [
          'Wash the bite area with soap and water.',
          'Cover it with a clean, dry, loose dressing.'
        ]
      },
      {
        text: 'Remove tight items',
        substeps: [
          'Remove rings, watches, or tight clothing near the bite site, as swelling will occur rapidly.'
        ]
      },
      {
        text: 'Note snake features (if safe)',
        substeps: [
          'Try to remember the snake\'s color, shape, and pattern from a safe distance to tell emergency doctors. If possible, take a photo from a safe distance.'
        ]
      }
    ],
    warnings: [
      'Do not apply a tourniquet or tight band.',
      'Do not cut the wound or try to suck out the venom by mouth or mechanical suction. This is ineffective and causes tissue damage or introduces infection.',
      'Do not apply ice or submerge the wound in water.',
      'Do not give the person caffeine, alcohol, or pain medications like aspirin/ibuprofen, which can thin the blood.'
    ],
    sources: [
      'World Health Organization (WHO) Snakebite Management Guidelines',
      'CDC Venomous Snakes First Aid'
    ]
  },
  {
    id: 'nosebleed',
    title: 'Nosebleed',
    description: 'Bleeding from the blood vessels in the nose, usually caused by dry air, picking, or minor trauma.',
    severity: 'MILD',
    bodyParts: ['head'],
    tags: ['nosebleed', 'nose', 'bleed', 'epistaxis', 'sniff'],
    immediateActions: [
      'Have the person sit upright and lean their head *forward* slightly.'
    ],
    timerType: 'none',
    steps: [
      {
        text: 'Pinch the nose',
        substeps: [
          'Pinch the soft part of the nose (just below the bony bridge) shut using your thumb and index finger.',
          'Breathe through the mouth.',
          'Hold this pinch continuously for 10 full minutes without releasing to check.'
        ]
      },
      {
        text: 'Apply cold compress',
        substeps: [
          'Place an ice pack wrapped in a cloth over the bridge of the nose to help constrict blood vessels.'
        ]
      },
      {
        text: 'After-care',
        substeps: [
          'Once bleeding stops, advise the person not to blow, pick, or rub their nose, and not to bend over for several hours to prevent restarting the bleed.'
        ]
      },
      {
        text: 'When to seek medical attention',
        substeps: [
          'Seek care if the nosebleed lasts longer than 20-30 minutes, follows a severe blow to the face, or occurs in a person taking blood thinners.'
        ]
      }
    ],
    warnings: [
      'Do not tilt the head backward. This causes blood to run down the throat, which can choke the person or irritate the stomach and cause vomiting.',
      'Do not stuff tissues, gauze, or cotton pads inside the nose.'
    ],
    sources: [
      'Mayo Clinic Nosebleed Care',
      'Cleveland Clinic Health Library'
    ]
  },
  {
    id: 'insect-sting',
    title: 'Insect Stings & Allergies',
    description: 'Bite or sting from bees, wasps, hornets, or ants. Can trigger mild local reactions or severe life-threatening anaphylaxis.',
    severity: 'MILD',
    bodyParts: ['arms', 'hands', 'legs', 'feet', 'head', 'abdomen', 'chest', 'neck', 'shoulders', 'upper_back', 'lower_back', 'pelvis'],
    tags: ['bee', 'sting', 'wasp', 'insect', 'bite', 'allergic', 'anaphylaxis', 'epipen', 'swelling', 'itch'],
    immediateActions: [
      'Check for signs of a severe allergic reaction (anaphylaxis): difficulty breathing, swelling of face/lips/throat, hives, dizziness, or confusion.',
      'If anaphylaxis is present, call 911 / 112 immediately and assist the person in using their epinephrine auto-injector (EpiPen) if they have one.'
    ],
    timerType: 'none',
    steps: [
      {
        text: 'Remove the stinger immediately',
        substeps: [
          'If stung by a bee, scrape the stinger off the skin using a flat edge like a credit card or your fingernail.',
          'Do not squeeze the stinger with tweezers, as this can inject more venom.'
        ]
      },
      {
        text: 'Clean the area',
        substeps: [
          'Wash the sting site with soap and water.'
        ]
      },
      {
        text: 'Apply cold compress and soothe skin',
        substeps: [
          'Apply an ice pack wrapped in a cloth to the site for 10 minutes to reduce pain and swelling.',
          'Apply hydrocortisone cream or calamine lotion to relieve itching.'
        ]
      },
      {
        text: 'Observe the patient',
        substeps: [
          'Monitor the person for at least 30 minutes to ensure no delayed signs of anaphylaxis appear.'
        ]
      }
    ],
    warnings: [
      'Do not squeeze the stinger or venom sac, as it releases more poison.',
      'Do not scratch the sting site, which increases the risk of introducing a secondary bacterial infection.'
    ],
    sources: [
      'American Academy of Allergy, Asthma & Immunology',
      'Mayo Clinic First Aid for Insect Stings'
    ]
  }
];
