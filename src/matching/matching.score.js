const normalize = (str) => {
  return str?.toLowerCase().trim();
};

const calculateScore = (u1, u2) => {
  let score = 0;

  if (normalize(u1.genre) === normalize(u2.genre)) {
    score += 40;
  }

  const levels = ["beginner", "intermediate", "advanced"];

  const diff = Math.abs(
    levels.indexOf(normalize(u1.skillLevel)) - levels.indexOf(normalize(u2.skillLevel)),
  );

  if (diff === 0) score += 30;
  else if (diff === 1) score += 15;

  if (normalize(u1.instrument) !== normalize(u2.instrument)) {
    score += 20;
  } else {
    score += 5;
  }

  if (normalize(u1.availability) === normalize(u2.availability)) {
    score += 10;
  }

  if(score>30){
  return score;
  }
};

export { calculateScore };
