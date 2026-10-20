export const QUESTIONS = [
  {
    id: 'q1',
    category: 'Nutrition & Hydration',
    text: 'How would you describe your daily eating and hydration habits?',
    options: [
      { id: 'opt1', label: 'Balanced & Hydrated', subtitle: 'I eat balanced meals regularly and stay adequately hydrated.', score: 0, icon: '🥗' },
      { id: 'opt2', label: 'Occasional Skips / High Caffeine', subtitle: 'I occasionally skip meals or rely heavily on coffee to get through the day.', score: 1, icon: '☕' },
      { id: 'opt3', label: 'Frequent Fatigue / Irregular Meals', subtitle: 'I frequently experience fatigue or digestive discomfort, or struggle to maintain regular meals.', score: 2, icon: '⚠️' }
    ]
  },
  {
    id: 'q2',
    category: 'Fitness & Mobility',
    text: 'How active do you feel throughout your day?',
    options: [
      { id: 'opt1', label: 'Regularly Active', subtitle: 'I exercise regularly and generally feel energetic.', score: 0, icon: '🏃' },
      { id: 'opt2', label: 'Seldom Exercise', subtitle: 'I seldom do exercises.', score: 1, icon: '🚶' },
      { id: 'opt3', label: 'Minimal Activity & Breathlessness', subtitle: 'I have minimal physical activity and often get tired or short of breath with ordinary exertion.', score: 2, icon: '😮‍💨' }
    ]
  },
  {
    id: 'q3',
    category: 'Stress & Sleep',
    text: 'How well are you managing your sleep and stress?',
    options: [
      { id: 'opt1', label: 'Restful Sleep & Well-Managed Stress', subtitle: 'I usually get enough restful sleep and manage stress well.', score: 0, icon: '😴' },
      { id: 'opt2', label: 'Occasional Fatigue / Stress', subtitle: 'I sometimes experience insufficient sleep, stress, or difficulty concentrating.', score: 1, icon: '🧠' },
      { id: 'opt3', label: 'Exhausted & Severe Stress', subtitle: 'I frequently wake up exhausted or experience significant stress that affects my daily activities.', score: 2, icon: '😫' }
    ]
  },
  {
    id: 'q4',
    category: 'Preventive Health Check',
    text: 'When was your last routine health check-up?',
    options: [
      { id: 'opt1', label: 'Recent Check-Up', subtitle: 'Within the past 12 months.', score: 0, icon: '🩺' },
      { id: 'opt2', label: '1 to 2 Years Ago', subtitle: 'More than 12 months ago but within the past 2 years.', score: 1, icon: '📅' },
      { id: 'opt3', label: 'Over 2 Years / Unsure', subtitle: 'More than 2 years ago, or I cannot remember.', score: 2, icon: '❓' }
    ]
  }
];