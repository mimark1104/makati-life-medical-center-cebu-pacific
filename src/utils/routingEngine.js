export function evaluateAssessment(answers) {
  let count0 = 0;
  let count1 = 0;
  let count2 = 0;

  Object.values(answers).forEach((score) => {
    if (score === 0) count0++;
    if (score === 1) count1++;
    if (score === 2) count2++;
  });

  let route = '';
  let priority = '';
  let recommendation = '';

  if (count2 >= 2) {
    route = 'ROUTE_A';
    priority = 'HIGH FOLLOW-UP PRIORITY';
    recommendation = 'Health Check-In / GP Consultation Recommended';
  } else if (count1 >= 2 || count2 === 1) {
    route = 'ROUTE_B';
    priority = 'STANDARD FOLLOW-UP PRIORITY';
    recommendation = 'Pre-Flight Wellness Check Recommended';
  } else {
    route = 'ROUTE_C';
    priority = 'LOW / OPTIONAL';
    recommendation = 'Routine Wellness Encouragement & Optional Check-Up';
  }

  return {
    counts: { 0: count0, 1: count1, 2: count2 },
    route,
    priority,
    recommendation
  };
}