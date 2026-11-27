(() => {
  const LANGUAGE_KEY = 'aamacare-language';

  // The English copy is also the stable key used by the current static and
  // dynamically-rendered screens. Keeping this map in one place means new
  // views and modal content get the same language behavior automatically.
  const translations = {
    'AamaCare · Pregnancy companion': 'आमाकेयर · गर्भावस्था सहयात्री',
    'AamaCare · My care dashboard': 'आमाकेयर · मेरो हेरचाह ड्यासबोर्ड',
    'Care, every week': 'हरेक हप्ता हेरचाह',
    'तपाईंको साथमा': 'तपाईंको साथमा',
    'Family connected': 'परिवार जोडिएको',
    'परिवारसँग जोडिएको': 'परिवारसँग जोडिएको',
    'Your pregnancy companion': 'तपाईंको गर्भावस्था सहयात्री',
    'Welcome back': 'फेरि स्वागत छ',
    'Personalized care, reminders, and trusted support for every step of your pregnancy.': 'तपाईंको गर्भावस्थाको हरेक चरणका लागि व्यक्तिगत हेरचाह, सम्झना र भरपर्दो सहयोग।',
    'Mobile number': 'मोबाइल नम्बर',
    'Password or PIN': 'पासवर्ड वा PIN',
    'Forgot PIN?': 'PIN बिर्सनुभयो?',
    'Keep me signed in': 'मलाई साइन इन राख्नुहोस्',
    'Continue securely': 'सुरक्षित रूपमा जारी राख्नुहोस्',
    'or': 'वा',
    'Preview the dashboard': 'ड्यासबोर्ड हेर्नुहोस्',
    'New to AamaCare?': 'आमाकेयरमा नयाँ हुनुहुन्छ?',
    'Create an account': 'खाता बनाउनुहोस्',
    'Your health information stays private and secure.': 'तपाईंको स्वास्थ्य जानकारी निजी र सुरक्षित रहन्छ।',
    'Your care space': 'तपाईंको हेरचाह क्षेत्र',
    'Overview': 'अवलोकन',
    'Pregnancy journey': 'गर्भावस्था यात्रा',
    'Health records': 'स्वास्थ्य अभिलेख',
    'Family hub': 'परिवार केन्द्र',
    'Health services': 'स्वास्थ्य सेवाहरू',
    'Learn & prepare': 'सिक्नुहोस् र तयारी गर्नुहोस्',
    'Need a little help?': 'अलिकति सहयोग चाहिन्छ?',
    'Ask Aama AI in Nepali or English.': 'नेपाली वा अंग्रेजीमा आमाकेयर AI लाई सोध्नुहोस्।',
    'Ask Aama AI': 'आमाकेयर AI लाई सोध्नुहोस्',
    'Settings': 'सेटिङहरू',
    'Sign out': 'साइन आउट',
    'My care dashboard': 'मेरो हेरचाह ड्यासबोर्ड',
    'Wednesday, 26 November 2026': 'बुधबार, २६ नोभेम्बर २०२६',
    'Good morning, Sita': 'शुभ प्रभात, सीता',
    'You are doing a wonderful job taking care of you and your baby.': 'तपाईंले आफ्नो र आफ्नो बच्चाको हेरचाह निकै राम्रोसँग गरिरहनुभएको छ।',
    "View today's plan": 'आजको योजना हेर्नुहोस्',
    'Weather watch for Lalitpur': 'ललितपुरका लागि मौसम सूचना',
    'Heavy rain is expected tonight. Keep your emergency contacts close.': 'आज राति ठूलो वर्षा हुने अनुमान छ। आपतकालीन सम्पर्कहरू नजिक राख्नुहोस्।',
    'Prepare with family': 'परिवारसँग तयारी गर्नुहोस्',
    'Your pregnancy journey': 'तपाईंको गर्भावस्था यात्रा',
    '24 weeks': '२४ हप्ता',
    '· 2nd trimester': '· दोस्रो त्रैमासिक',
    'Week 1': 'हप्ता १',
    'Week 24': 'हप्ता २४',
    'Week 40': 'हप्ता ४०',
    'Estimated due date': 'अनुमानित प्रसूति मिति',
    '15 March 2027': '१५ मार्च २०२७',
    "Baby's size": 'बच्चाको आकार',
    'About an eggplant': 'भण्टाजत्रो',
    "Explore this week's journey": 'यो हप्ताको यात्रा हेर्नुहोस्',
    'Next up': 'अबको काम',
    'Health checkup': 'स्वास्थ्य जाँच',
    'DEC': 'डिसेम्बर',
    'Routine antenatal visit': 'नियमित गर्भ जाँच',
    'Thu, 3 December · 10:30 AM': 'बिहीबार, ३ डिसेम्बर · बिहान १०:३०',
    'Patan Hospital · Outpatient wing': 'पाटन अस्पताल · बहिरङ्ग विभाग',
    'View details': 'विवरण हेर्नुहोस्',
    'Remind me': 'मलाई सम्झाउनुहोस्',
    'Here when you need it': 'आवश्यक पर्दा यहाँ',
    'Quick actions': 'छिटो कामहरू',
    'Text or speak in Nepali': 'नेपालीमा लेख्नुहोस् वा बोल्नुहोस्',
    'Add health record': 'स्वास्थ्य अभिलेख थप्नुहोस्',
    'Keep your care history close': 'आफ्नो हेरचाह इतिहास सुरक्षित राख्नुहोस्',
    'Find nearby care': 'नजिकको हेरचाह खोज्नुहोस्',
    'Health posts & hospitals': 'स्वास्थ्य चौकी र अस्पतालहरू',
    'Open family hub': 'परिवार केन्द्र खोल्नुहोस्',
    'Keep your circle connected': 'आफ्नो सहयोगी समूह जोडिराख्नुहोस्',
    'Small steps, big care': 'सानो कदम, ठूलो हेरचाह',
    "Today's checklist": 'आजको जाँचसूची',
    '2 of 4 done': '४ मध्ये २ पूरा',
    '0 of 4 done': '४ मध्ये ० पूरा',
    '1 of 4 done': '४ मध्ये १ पूरा',
    '3 of 4 done': '४ मध्ये ३ पूरा',
    '4 of 4 done': '४ मध्ये ४ पूरा',
    '＋ Add item': '＋ काम थप्नुहोस्',
    'Add a checklist item': 'जाँचसूचीमा काम थप्नुहोस्',
    'What do you want to remember?': 'के सम्झन चाहनुहुन्छ?',
    'Details': 'विवरण',
    'optional': 'वैकल्पिक',
    'When?': 'कहिले?',
    'Add to checklist': 'जाँचसूचीमा थप्नुहोस्',
    'Drink 8 glasses of water': '८ गिलास पानी पिउनुहोस्',
    'Stay hydrated throughout the day': 'दिनभरि शरीरमा पानीको मात्रा कायम राख्नुहोस्',
    'Take your prescribed supplement': 'तोकिएको पूरक औषधि लिनुहोस्',
    'As advised by your health worker': 'स्वास्थ्यकर्मीको सल्लाहअनुसार',
    "Watch this week's care video": 'यो हप्ताको हेरचाह भिडियो हेर्नुहोस्',
    'Movement and comfort in trimester two': 'दोस्रो त्रैमासिकमा चालचलन र आराम',
    'Share the weather watch with family': 'मौसम सूचना परिवारसँग बाँड्नुहोस्',
    'Keep your support circle informed': 'आफ्नो सहयोगी समूहलाई जानकारी दिइराख्नुहोस्',
    'Today': 'आज',
    'See all reminders': 'सबै सम्झना हेर्नुहोस्',
    'Made for week 24': 'हप्ता २४ का लागि तयार',
    'Your weekly guide': 'तपाईंको साप्ताहिक मार्गदर्शन',
    'See all': 'सबै हेर्नुहोस्',
    'Nutrition': 'पोषण',
    'Simple local foods for you and baby': 'तपाईं र बच्चाका लागि सरल स्थानीय खाना',
    'Read guide →': 'मार्गदर्शन पढ्नुहोस् →',
    'Video · 04 min': 'भिडियो · ०४ मिनेट',
    'Gentle movement for a growing belly': 'बढ्दै गरेको पेटका लागि हल्का चालचलन',
    'Watch now →': 'अहिले हेर्नुहोस् →',
    'Your support circle': 'तपाईंको सहयोगी समूह',
    'Ram and Asha': 'राम र आशा',
    'are following your care plan.': 'तपाईंको हेरचाह योजना पछ्याउँदै हुनुहुन्छ।',
    'Nearby care': 'नजिकको हेरचाह',
    '2.4 km away · Open today until 5:00 PM': '२.४ किमि टाढा · आज बेलुका ५:०० बजेसम्म खुला',
    'Get directions': 'बाटो हेर्नुहोस्',
    'Need urgent help?': 'तत्काल सहयोग चाहिन्छ?',
    'Call your trusted contact or find emergency care.': 'आफ्नो भरपर्दो सम्पर्कमा फोन गर्नुहोस् वा आपतकालीन हेरचाह खोज्नुहोस्।',
    'Get help': 'सहयोग लिनुहोस्',
    'AamaCare is here to support, not replace, your health worker.': 'आमाकेयर तपाईंको स्वास्थ्यकर्मीको सहयोगी हो, विकल्प होइन।',
    'Privacy': 'गोपनीयता',
    'Help center': 'सहयोग केन्द्र',
    'Your nine-month story': 'तपाईंको नौ महिनाको कथा',
    "Follow your baby's growth and find the right care for each week of your pregnancy.": 'आफ्नो बच्चाको विकास पछ्याउनुहोस् र गर्भावस्थाको हरेक हप्ताका लागि सही हेरचाह खोज्नुहोस्।',
    'View calendar': 'क्यालेन्डर हेर्नुहोस्',
    'Share journey': 'यात्रा बाँड्नुहोस्',
    'You are here': 'तपाईं यहाँ हुनुहुन्छ',
    'Week 24 · Your baby is growing beautifully.': 'हप्ता २४ · तपाईंको बच्चा सुन्दर रूपमा बढ्दैछ।',
    'Your baby is growing beautifully.': 'तपाईंको बच्चा सुन्दर रूपमा बढ्दैछ।',
    'Your baby is about the size of an eggplant. This week, focus on gentle movement, hydration, and your next antenatal visit.': 'तपाईंको बच्चा भण्टाजत्रो भएको छ। यो हप्ता हल्का चालचलन, पानी र अर्को गर्भ जाँचमा ध्यान दिनुहोस्।',
    'journey complete': 'यात्रा पूरा',
    'until your due date': 'प्रसूति मितिसम्म',
    "This week's focus": 'यो हप्ताको ध्यान',
    'Keep your care circle close': 'आफ्नो सहयोगी समूह नजिक राख्नुहोस्',
    'Prepare for your next checkup': 'अर्को जाँचका लागि तयारी गर्नुहोस्',
    'Ask a family member to help with transport.': 'यातायातमा सहयोग गर्न परिवारका सदस्यलाई सोध्नुहोस्।',
    'Week 24 of 40': '४० मध्ये हप्ता २४',
    'First trimester': 'पहिलो त्रैमासिक',
    'Second trimester': 'दोस्रो त्रैमासिक',
    'Third trimester': 'तेस्रो त्रैमासिक',
    'Your timeline': 'तपाईंको समयरेखा',
    'Weekly milestones': 'साप्ताहिक उपलब्धिहरू',
    'See all weeks': 'सबै हप्ता हेर्नुहोस्',
    'Done': 'पूरा',
    'Current': 'हाल',
    'Coming up': 'आउँदैछ',
    'Finding your rhythm': 'आफ्नो लय भेट्दै',
    'Growing stronger': 'झन् बलियो हुँदै',
    'Care for both of you': 'तपाईं दुवैको हेरचाह',
    'A little more movement': 'अलि बढी चालचलन',
    'Your health, in one place': 'तपाईंको स्वास्थ्य, एउटै ठाउँमा',
    'Keep your visits, measurements, tests, and recommendations organized for you and your health worker.': 'आफ्ना भेटघाट, मापन, परीक्षण र सुझावहरू आफू तथा स्वास्थ्यकर्मीका लागि व्यवस्थित राख्नुहोस्।',
    'Export': 'निर्यात गर्नुहोस्',
    '＋ Add record': '＋ अभिलेख थप्नुहोस्',
    '6 visits': '६ भेटघाट',
    'Antenatal care visits': 'गर्भ जाँच भेटघाट',
    '3 tests': '३ परीक्षण',
    'Latest on 16 Nov': 'पछिल्लो १६ नोभेम्बरमा',
    'On track': 'योजनाअनुसार',
    'Next visit in 7 days': 'अर्को भेट ७ दिनमा',
    '2 files': '२ फाइल',
    'Reports saved safely': 'रिपोर्टहरू सुरक्षित राखिएका छन्',
    'Recent activity': 'हालैको गतिविधि',
    'Your care timeline': 'तपाईंको हेरचाह समयरेखा',
    'Blood pressure and weight recorded': 'रक्तचाप र तौल अभिलेख गरिएको',
    'Ultrasound report added': 'अल्ट्रासाउन्ड रिपोर्ट थपियो',
    'Second trimester scan · Shared by Sita': 'दोस्रो त्रैमासिक स्क्यान · सीताले बाँड्नुभयो',
    'Health worker note': 'स्वास्थ्यकर्मीको नोट',
    'Continue your prescribed supplement': 'तोकिएको पूरक औषधि निरन्तर लिनुहोस्',
    'View full timeline': 'पूरा समयरेखा हेर्नुहोस्',
    'Your latest summary': 'तपाईंको पछिल्लो सारांश',
    'A clear picture of your care': 'तपाईंको हेरचाहको स्पष्ट चित्र',
    'We summarize the records you choose to save so you can quickly remember what matters before your next visit.': 'तपाईंले सुरक्षित गर्न रोजेका अभिलेखको सारांश राख्छौँ, ताकि अर्को भेटअघि महत्वपूर्ण कुरा सम्झन सजिलो होस्।',
    'Next step:': 'अर्को कदम:',
    'Your routine antenatal checkup at Patan Hospital is scheduled for 3 December at 10:30 AM.': 'पाटन अस्पतालमा तपाईंको नियमित गर्भ जाँच ३ डिसेम्बर बिहान १०:३० बजे तय भएको छ।',
    'Share with health worker': 'स्वास्थ्यकर्मीसँग बाँड्नुहोस्',
    'Your trusted circle': 'तपाईंको भरपर्दो समूह',
    'Keep the people you trust informed, involved, and ready to help when you need them.': 'तपाईंले विश्वास गर्ने मानिसहरूलाई जानकारीमा, सहभागी र आवश्यक पर्दा सहयोगका लागि तयार राख्नुहोस्।',
    '＋ Invite someone': '＋ कसैलाई निम्तो दिनुहोस्',
    'You are supported': 'तपाईंलाई सहयोग छ',
    'Care feels better together.': 'सँगै हुँदा हेरचाह अझ राम्रो लाग्छ।',
    'Your family can follow shared tasks and receive the updates you choose. You stay in control of what they can see.': 'तपाईंको परिवारले साझा काम पछ्याउन र तपाईंले रोजेका अपडेट पाउन सक्छ। उनीहरूले के हेर्न पाउने भन्ने नियन्त्रण तपाईंसँगै रहन्छ।',
    'People you trust': 'तपाईंले विश्वास गर्ने मानिसहरू',
    'Circle members': 'समूहका सदस्यहरू',
    'Partner · Can view tasks': 'जीवनसाथी · कामहरू हेर्न सक्छ',
    'Mother · Can view visits': 'आमा · भेटघाट हेर्न सक्छ',
    'You · Owner': 'तपाईं · मालिक',
    'Add someone': 'कसैलाई थप्नुहोस्',
    'Invite a neighbour or friend': 'छिमेकी वा साथीलाई निम्तो दिनुहोस्',
    'Shared support': 'साझा सहयोग',
    'Family checklist': 'परिवार जाँचसूची',
    'Confirm transport for checkup': 'जाँचका लागि यातायात पक्का गर्नुहोस्',
    'Keep emergency contacts updated': 'आपतकालीन सम्पर्कहरू अद्यावधिक राख्नुहोस्',
    'Share heavy-rain preparation tips': 'ठूलो वर्षाको तयारीका सुझाव बाँड्नुहोस्',
    'Prepare a small care bag': 'सानो हेरचाह झोला तयार गर्नुहोस्',
    'This week': 'यो हप्ता',
    'See shared checklist': 'साझा जाँचसूची हेर्नुहोस्',
    'Care, closer to you': 'तपाईंको नजिकको हेरचाह',
    'Find health posts, hospitals, pharmacies, and emergency support near your selected location.': 'तपाईंले छानेको स्थान नजिक स्वास्थ्य चौकी, अस्पताल, औषधि पसल र आपतकालीन सहयोग खोज्नुहोस्।',
    'Use my location': 'मेरो स्थान प्रयोग गर्नुहोस्',
    'Search by name, service, or location': 'नाम, सेवा वा स्थानबाट खोज्नुहोस्',
    'Filter': 'फिल्टर',
    'Near Lalitpur': 'ललितपुर नजिक',
    'Recommended for you': 'तपाईंका लागि सिफारिस',
    '3 places': '३ ठाउँ',
    'Maternity care · Emergency · Open until 5 PM': 'प्रसूति हेरचाह · आपतकालीन · बेलुका ५ बजेसम्म खुला',
    'Antenatal care · Health post · Open until 4 PM': 'गर्भ जाँच · स्वास्थ्य चौकी · बेलुका ४ बजेसम्म खुला',
    'Pharmacy · Prescriptions · Open until 8 PM': 'औषधि पसल · प्रिस्क्रिप्सन · बेलुका ८ बजेसम्म खुला',
    'Your care map': 'तपाईंको हेरचाह नक्सा',
    'Nearby support': 'नजिकको सहयोग',
    'Tap a place to see directions, phone numbers, and available services.': 'बाटो, फोन नम्बर र उपलब्ध सेवाहरू हेर्न ठाउँमा ट्याप गर्नुहोस्।',
    'Trusted, simple guidance': 'भरपर्दो, सरल मार्गदर्शन',
    'Explore trimester-specific food, exercise, videos, birth preparation, and government support information.': 'त्रैमासिकअनुसार खाना, व्यायाम, भिडियो, प्रसूति तयारी र सरकारी सहयोगसम्बन्धी जानकारी हेर्नुहोस्।',
    'Saved for later ♡': 'पछि हेर्न सुरक्षित ♡',
    'Recommended for week 24': 'हप्ता २४ का लागि सिफारिस',
    'A four-minute Ministry of Health video with simple movements you can discuss with your health worker.': 'स्वास्थ्यकर्मीसँग छलफल गर्न सकिने सरल चालचलनसम्बन्धी स्वास्थ्य मन्त्रालयको चार मिनेटको भिडियो।',
    'Browse by topic': 'विषयअनुसार हेर्नुहोस्',
    'What would you like to learn?': 'तपाईं के सिक्न चाहनुहुन्छ?',
    'Food & nutrition': 'खाना र पोषण',
    'Local food ideas': 'स्थानीय खानाका विचार',
    'Movement': 'चालचलन',
    'Safe exercises': 'सुरक्षित व्यायाम',
    'Birth preparation': 'प्रसूति तयारी',
    'Plan with confidence': 'विश्वासका साथ योजना बनाउनुहोस्',
    'Support information': 'सहयोगसम्बन्धी जानकारी',
    'Know your options': 'आफ्ना विकल्प जान्नुहोस्',
    'Watch and listen': 'हेर्नुहोस् र सुन्नुहोस्',
    'Recommended videos': 'सिफारिस गरिएका भिडियो',
    'Eating well with local foods': 'स्थानीय खानासँग राम्रो पोषण',
    'Nutrition · Second trimester': 'पोषण · दोस्रो त्रैमासिक',
    'Preparing your family for delivery': 'प्रसूतिको लागि परिवार तयार पार्दै',
    'Listen in Nepali · 06 min': 'नेपालीमा सुन्नुहोस् · ०६ मिनेट',
    'Audio': 'अडियो',
    'Welcome back, Sita. Your care dashboard is ready.': 'फेरि स्वागत छ, सीता। तपाईंको हेरचाह ड्यासबोर्ड तयार छ।',
    'Preview mode started. No account was created.': 'पूर्वावलोकन सुरु भयो। कुनै खाता बनाइएको छैन।',
    'You have been signed out safely.': 'तपाईं सुरक्षित रूपमा साइन आउट हुनुभयो।',
    'PIN recovery will be connected to SMS in the next build.': 'अर्को संस्करणमा PIN पुनःप्राप्ति SMS सँग जोडिनेछ।',
    'Task marked complete.': 'कार्य पूरा भएको चिन्ह लगाइयो।',
    'Task added back to your list.': 'कार्य फेरि तपाईंको सूचीमा थपियो।',
    'Weather alert dismissed for now.': 'मौसम चेतावनी अहिलेका लागि हटाइयो।',
    'Voice input is not supported here. Please use Chrome or Edge on localhost.': 'यहाँ आवाज इनपुट समर्थित छैन। कृपया localhost मा Chrome वा Edge प्रयोग गर्नुहोस्।',
    'Voice input is not supported in this browser.': 'यो ब्राउजरमा आवाज इनपुट समर्थित छैन।',
    'Listening… speak now.': 'सुन्दैछु… अब बोल्नुहोस्।',
    'Transcript ready. Press Send when you are ready.': 'लिप्यन्तरण तयार छ। तयार भएपछि पठाउनुहोस् थिच्नुहोस्।',
    'Hearing you…': 'तपाईंको आवाज सुनिँदैछ…',
    'I could not connect right now. Please try again.': 'अहिले जडान हुन सकेन। कृपया फेरि प्रयास गर्नुहोस्।',
    'Show password': 'पासवर्ड देखाउनुहोस्',
    'Hide password': 'पासवर्ड लुकाउनुहोस्',
    'Change language': 'भाषा परिवर्तन गर्नुहोस्',
    'Open navigation': 'नेभिगेसन खोल्नुहोस्',
    'View notifications': 'सूचना हेर्नुहोस्',
    'Open profile menu': 'प्रोफाइल मेनु खोल्नुहोस्',
    'My profile': 'मेरो प्रोफाइल',
    'Dismiss weather alert': 'मौसम चेतावनी हटाउनुहोस्',
    'Close Aama AI': 'आमाकेयर AI बन्द गर्नुहोस्',
    'Close dialog': 'संवाद बन्द गर्नुहोस्',
    'Pregnancy care': 'गर्भावस्था हेरचाह',
    'Frequently asked questions': 'बारम्बार सोधिने प्रश्नहरू',
    'Pregnancy FAQs': 'गर्भवती महिलाहरूका लागि बारम्बार सोधिने प्रश्नहरू',
    'This is general information. For advice based on your situation, consult your nearby health post, hospital, or Female Community Health Volunteer.': 'यो सामान्य जानकारी हो। आफ्नो अवस्था अनुसार नजिकको स्वास्थ्यचौकी, अस्पताल वा महिला स्वास्थ्य स्वयंसेविकासँग सल्लाह लिनुहोस्।',
    'What should I do first after finding out I am pregnant?': 'गर्भवती भएको थाहा पाएपछि पहिलो काम के गर्ने?',
    'Visit a nearby health facility for a pregnancy checkup and your first antenatal care (ANC) visit. This helps keep both you and your baby safe.': 'नजिकको स्वास्थ्य संस्थामा गएर गर्भ जाँच र पहिलो पटक गर्भवती जाँच (ANC) गराउनुहोस्। यसले आमा र बच्चा दुवैको सुरक्षा हुन्छ।',
    'How often should I have antenatal checkups?': 'गर्भवती जाँच कति पटक गराउनुपर्छ?',
    'According to the National Safe Motherhood Programme, you should have at least 8 checkups. If you have a problem, go more often as advised by your health worker.': 'राष्ट्रिय सुरक्षित मातृत्व कार्यक्रम अनुसार कम्तीमा ८ पटक जाँच गराउनुपर्छ। समस्या भए स्वास्थ्यकर्मीले भनेअनुसार थप पटक जानुपर्छ।',
    'What should I eat during pregnancy?': 'गर्भावस्थामा के खाने?',
    'Lentils, beans, eggs, fish, meat, milk, and yogurt': 'दाल, गेडागुडी, अण्डा, माछा, मासु, दूध र दही',
    'Green leafy vegetables and seasonal fruits': 'हरियो सागपात र मौसमी फलफूल',
    'Grains such as rice, roti, and dhido': 'भात, रोटी, ढिँडो जस्ता अन्न',
    'Plenty of water': 'पर्याप्त पानी',
    'Eat foods from all groups and eat slightly more than usual in small, frequent meals.': 'सबै समूहका खाना खाने र सामान्यभन्दा केही बढी, पटक-पटक खाने गर्नुहोस्।',
    'Why should I take iron and calcium tablets?': 'आइरन चक्की र क्याल्सियम किन खानुपर्छ?',
    "Iron tablets help prevent anemia. Calcium supports the mother's bones and the baby's development. These tablets are available free of charge at health facilities, and you should take them regularly as advised by your health worker.": 'आइरन चक्कीले रगतको कमी (एनिमिया) रोक्छ। क्याल्सियमले आमाको हड्डी र बच्चाको विकासमा मद्दत गर्छ। यी चक्की स्वास्थ्य संस्थाबाट निःशुल्क पाइन्छन्, र स्वास्थ्यकर्मीले भनेअनुसार नियमित खानुपर्छ।',
    'Should I get vaccinated?': 'खोप लगाउनुपर्छ?',
    'Yes. You should receive the Td vaccine during pregnancy to protect against tetanus. Ask your health worker how many doses you need.': 'हो। टिटानसबाट बचाउन गर्भवती हुँदा Td खोप लगाउनुपर्छ। कति मात्रा चाहिन्छ भन्ने कुरा स्वास्थ्यकर्मीसँग सोध्नुहोस्।',
    'Can I buy and take medicine myself?': 'औषधि आफैँ किनेर खान मिल्छ?',
    'No. Do not take any medicine, herbs, or home remedies without advice from a doctor or health worker.': 'मिल्दैन। डाक्टर वा स्वास्थ्यकर्मीको सल्लाहबिना कुनै औषधि, जडीबुटी वा घरेलु उपचार नखानुहोस्।',
    'Can I work and walk during pregnancy?': 'गर्भावस्थामा काम गर्न र हिँड्न मिल्छ?',
    'Yes, light work and walking can be beneficial. However, avoid heavy lifting, standing for long periods, and work that causes excessive tiredness. Rest during the day and sleep for 8 hours at night.': 'मिल्छ, हल्का काम र हिँडडुल लाभदायक हुन्छ। तर धेरै भारी बोक्ने, लामो समय उभिने र अत्यधिक थकान हुने काम नगर्नुहोस्। दिनमा आराम र रातमा ८ घन्टा निद्रा लिनुहोस्।',
    'When does the baby start moving, and how much movement is normal?': 'बच्चाले कहिलेदेखि चल्छ, कति चलेको सामान्य हो?',
    "You will usually begin to feel the baby move at around 4–5 months. If the baby's movement suddenly decreases or stops, go to a health facility immediately.": 'सामान्यतया ४–५ महिनाबाट बच्चाको चाल महसुस हुन थाल्छ। बच्चाको चाल अचानक कम भयो वा बन्द भयो भने तुरुन्तै स्वास्थ्य संस्था जानुहोस्।',
    'What symptoms require an immediate hospital visit? (Danger signs)': 'कस्ता लक्षण देखिए तुरुन्तै अस्पताल जानुपर्छ? (खतराका चिन्ह)',
    'Bleeding from the vagina': 'योनीबाट रगत बग्नु',
    'Severe headache or blurred vision': 'कडा टाउको दुखाइ वा आँखा धमिलो हुनु',
    'Severe swelling of the face, hands, or feet': 'अनुहार, हात वा खुट्टा धेरै सुन्निनु',
    'Shaking or seizure-like fits': 'काँप्नु, छारे रोग जस्तो झट्का आउनु',
    'Fever': 'ज्वरो आउनु',
    'Severe abdominal pain': 'पेट धेरै दुख्नु',
    'Your waters breaking (fluid leaking)': 'पानीको थैली फुट्नु (पानी बग्नु)',
    'Reduced or stopped baby movement': 'बच्चाको चाल कम हुनु वा बन्द हुनु',
    'Where should I give birth?': 'सुत्केरी कहाँ गराउने?',
    'Giving birth at a health facility (health post, hospital, or birthing centre) with the help of a skilled health worker is the safest option.': 'स्वास्थ्य संस्था (स्वास्थ्यचौकी, अस्पताल, जन्म केन्द्र) मा दक्ष स्वास्थ्यकर्मीको सहयोगमा सुत्केरी गराउनु सबैभन्दा सुरक्षित हुन्छ।',
    'How can I arrange delivery costs and transport?': 'सुत्केरीको खर्च र यातायात कसरी मिल्छ?',
    'Under the government Aama Programme, delivery at a health facility includes free services and transport support. Ask your local health facility about the current arrangements and amount.': 'सरकारको आमा कार्यक्रम अन्तर्गत स्वास्थ्य संस्थामा सुत्केरी गराउँदा निःशुल्क सेवा र यातायात खर्च पाइन्छ। हालको व्यवस्था र रकम स्थानीय स्वास्थ्य संस्थामा सोध्नुहोस्।',
    'What preparations should I make before delivery?': 'सुत्केरी हुनुअघि के तयारी गर्ने?',
    'Arrange the place of delivery and transport': 'सुत्केरी हुने स्थान र यातायातको व्यवस्था मिलाउने',
    'Save money for emergency expenses': 'आपतकालीन खर्चका लागि पैसा जम्मा गर्ने',
    'Decide who can donate blood and who will accompany you': 'रगत दिन सक्ने व्यक्ति र साथमा जाने मान्छे तय गर्ने',
    'Prepare necessary clothes and documents': 'आवश्यक कपडा र कागजात तयार राख्ने',
    'What should I pay attention to after delivery?': 'सुत्केरी भएपछि के ध्यान दिने?',
    'Have a health check within 24 hours after delivery, then on day 3 and day 7. Breastfeed your newborn within 1 hour of birth and give only breast milk for the first 6 months.': 'सुत्केरी भएको २४ घन्टा भित्र, ३ दिन, र ७ दिनमा स्वास्थ्य जाँच गराउनुहोस्। नवजात शिशुलाई जन्मको १ घन्टा भित्र आमाको दूध खुवाउनुहोस् र ६ महिनासम्म आमाको दूध मात्र खुवाउनुहोस्।',
    'If you want, we can also turn this into a printable or shareable PDF or Word file, or expand a topic such as nutrition or danger signs.': 'चाहनुहुन्छ भने हामी यसलाई छापेर वा सेयर गर्न मिल्ने PDF वा Word फाइलमा बनाउन सक्छौँ, वा पोषण अथवा खतराका चिन्ह जस्तो कुनै विषयलाई थप विस्तारमा लेख्न सक्छौँ।',
    'AamaCare dashboard': 'आमाकेयर ड्यासबोर्ड',
    'Weather alert': 'मौसम चेतावनी',
    'Pregnancy overview': 'गर्भावस्था अवलोकन',
    'More pregnancy journey options': 'गर्भावस्था यात्राका थप विकल्प',
    'More family hub options': 'परिवार केन्द्रका थप विकल्प',
    'Sita K.': 'सीता के.',
    'My profile': 'मेरो प्रोफाइल',
    'Patan Hospital': 'पाटन अस्पताल',
    '03': '०३',
    '8:00 AM': 'बिहान ८:००',
    '9:00 AM': 'बिहान ९:००',
    'Thinking…': 'सोच्दैछु…',
    'Journey calendar opened': 'यात्रा क्यालेन्डर खोलियो',
    'Journey sharing opened': 'यात्रा बाँड्ने विकल्प खोलियो',
    'All weeks opened': 'सबै हप्ता खोलियो',
    'More health record options': 'स्वास्थ्य अभिलेखका थप विकल्प',
    'Search health services': 'स्वास्थ्य सेवाहरू खोज्नुहोस्',
    'Your care, your choices': 'तपाईंको हेरचाह, तपाईंका छनोट',
    'Settings': 'सेटिङहरू',
    'Control your language, reminders, privacy, and support preferences.': 'आफ्नो भाषा, सम्झना, गोपनीयता र सहयोगका प्राथमिकता नियन्त्रण गर्नुहोस्।',
    'Save changes': 'परिवर्तन सुरक्षित गर्नुहोस्',
    'Your settings have been saved': 'तपाईंका सेटिङहरू सुरक्षित गरियो',
    'Personal preferences': 'व्यक्तिगत प्राथमिकताहरू',
    'Make AamaCare feel right for you': 'आमाकेयरलाई आफ्ना लागि उपयुक्त बनाउनुहोस्',
    'Language': 'भाषा',
    'Choose the language used in guidance and reminders.': 'मार्गदर्शन र सम्झनामा प्रयोग हुने भाषा छान्नुहोस्।',
    'English': 'अंग्रेजी',
    'Care reminders': 'हेरचाह सम्झना',
    'Get gentle reminders for visits and daily tasks.': 'भेटघाट र दैनिक कामका लागि सरल सम्झना पाउनुहोस्।',
    'Family updates': 'परिवारका अपडेट',
    'Allow your trusted circle to receive selected updates.': 'आफ्नो भरपर्दो समूहलाई छानिएका अपडेट पाउन दिनुहोस्।',
    'Weather watch': 'मौसम सूचना',
    'Receive local safety alerts for Lalitpur.': 'ललितपुरका स्थानीय सुरक्षा सूचना पाउनुहोस्।',
    'Privacy and support': 'गोपनीयता र सहयोग',
    'Your information stays in your control.': 'तपाईंको जानकारीमाथि नियन्त्रण तपाईंसँगै रहन्छ।',
    'AamaCare supports your conversations with your health worker. You decide what to share with family, and you can change these choices whenever you want.': 'आमाकेयरले स्वास्थ्यकर्मीसँगको कुराकानीमा सहयोग गर्छ। परिवारसँग के बाँड्ने भन्ने निर्णय तपाईंले गर्नुहुन्छ र चाहेको बेला परिवर्तन गर्न सक्नुहुन्छ।',
    'Review privacy controls': 'गोपनीयता नियन्त्रण हेर्नुहोस्',
    'Privacy controls opened': 'गोपनीयता नियन्त्रण खोलियो',
    'Open help center': 'सहयोग केन्द्र खोल्नुहोस्',
    'Help center opened': 'सहयोग केन्द्र खोलियो',
    'Today’s plan': 'आजको योजना',
    "Today's plan": 'आजको योजना',
    'Your care plan for today': 'आजको तपाईंको हेरचाह योजना',
    'Morning': 'बिहान',
    'Afternoon': 'दिउँसो',
    'Evening': 'साँझ',
    'Hydrate and take your prescribed supplement': 'पानी पिउनुहोस् र तोकिएको पूरक औषधि लिनुहोस्',
    'Watch your weekly movement video': 'आफ्नो साप्ताहिक चालचलन भिडियो हेर्नुहोस्',
    'Keep emergency contacts close during heavy rain': 'ठूलो वर्षामा आपतकालीन सम्पर्कहरू नजिक राख्नुहोस्',
    'Got it': 'बुझें',
    'Close': 'बन्द गर्नुहोस्',
    'Reminder set for your next antenatal visit.': 'अर्को गर्भ जाँचका लागि सम्झना राखियो।',
    'Your record summary is being prepared for export.': 'तपाईंको अभिलेख सारांश निर्यातका लागि तयार हुँदैछ।',
    'Health record saved to your timeline.': 'स्वास्थ्य अभिलेख तपाईंको समयरेखामा सुरक्षित गरियो।',
    'Family invitation prepared.': 'परिवारको निम्तो तयार गरियो।',
    'Family task marked complete.': 'परिवारको काम पूरा भएको चिन्ह लगाइयो।',
    'Family task added back.': 'परिवारको काम फेरि थपियो।',
    'Your selected summary was shared with the care circle.': 'तपाईंले छानेको सारांश हेरचाह समूहसँग बाँडियो।',
    'Location access will be connected to the service directory.': 'स्थान पहुँच सेवा निर्देशिकासँग जोडिनेछ।',
    'Your current location?': 'तपाईंको हालको स्थान?',
    'Use your current location?': 'हालको स्थान प्रयोग गर्ने?',
    'Keep Lalitpur': 'ललितपुर नै राख्नुहोस्',
    'Use location': 'स्थान प्रयोग गर्नुहोस्',
    'Apply filters': 'फिल्टर लागू गर्नुहोस्',
    'Call': 'फोन गर्नुहोस्',
    'Show content': 'सामग्री देखाउनुहोस्',
    'Close player': 'प्लेयर बन्द गर्नुहोस्',
    'Voice input is not supported here. Please use Chrome or Edge on localhost.': 'यहाँ आवाज इनपुट समर्थित छैन। कृपया localhost मा Chrome वा Edge प्रयोग गर्नुहोस्।',
  };

  let language = 'en';
  const originalText = new WeakMap();

  function normalize(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function readLanguage() {
    try {
      return localStorage.getItem(LANGUAGE_KEY) === 'ne' ? 'ne' : 'en';
    } catch {
      return 'en';
    }
  }

  function t(value) {
    const english = originalText.get(value) || value;
    if (language === 'en') return english;
    return translations[normalize(english)] || english;
  }

  function translateTextNode(node) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const source = originalText.get(node);
    const key = normalize(source);
    if (!key || !translations[key]) return;
    const leading = source.match(/^\s*/)?.[0] || '';
    const trailing = source.match(/\s*$/)?.[0] || '';
    node.nodeValue = language === 'ne' ? `${leading}${translations[key]}${trailing}` : source;
  }

  function translateAttribute(element, attribute) {
    const marker = `data-i18n-original-${attribute}`;
    if (!element.hasAttribute(marker)) element.setAttribute(marker, element.getAttribute(attribute) || '');
    const source = element.getAttribute(marker);
    if (!source) return;
    element.setAttribute(attribute, language === 'ne' ? (translations[normalize(source)] || source) : source);
  }

  function translatePage() {
    document.querySelectorAll('body *').forEach((element) => {
      element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
      });
      ['placeholder', 'aria-label', 'data-toast'].forEach((attribute) => {
        if (element.hasAttribute(attribute)) translateAttribute(element, attribute);
      });
    });
    document.documentElement.lang = language;
    document.querySelectorAll('.language-button').forEach((button) => {
      button.setAttribute('aria-label', language === 'en' ? 'Change language' : 'भाषा परिवर्तन गर्नुहोस्');
      button.innerHTML = language === 'en' ? 'ने <span>EN</span>' : 'EN <span>ने</span>';
      button.dataset.language = language;
    });
    document.querySelectorAll('.settings-row select').forEach((select) => {
      select.value = language === 'ne' ? 'नेपाली' : 'English';
    });
    document.title = language === 'ne'
      ? (document.querySelector('#dashboard-screen:not(.is-hidden)') ? translations['AamaCare · My care dashboard'] : translations['AamaCare · Pregnancy companion'])
      : (document.querySelector('#dashboard-screen:not(.is-hidden)') ? 'AamaCare · My care dashboard' : 'AamaCare · Pregnancy companion');
  }

  function setLanguage(nextLanguage) {
    language = nextLanguage === 'ne' ? 'ne' : 'en';
    try { localStorage.setItem(LANGUAGE_KEY, language); } catch { /* preference is session-only */ }
    translatePage();
    document.dispatchEvent(new CustomEvent('aama-language-change', { detail: { language } }));
  }

  function toggle() {
    setLanguage(language === 'en' ? 'ne' : 'en');
  }

  window.AamaI18n = { t, translatePage, setLanguage, toggle, getLanguage: () => language };

  document.addEventListener('DOMContentLoaded', () => {
    language = readLanguage();
    document.addEventListener('click', (event) => {
      if (event.target.closest('.language-button')) toggle();
    });
    translatePage();
  });
})();
