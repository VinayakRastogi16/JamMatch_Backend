const normalize = (str)=>{
    return str?.toLowerCase().trim();
}

const calculateScore = (u1, u2) => {
  let score = 0;

  if (normalize(u1.genre) === normalize(u2.genre)) {
    score += 40;
  }

  if (normalize(u1.skillLevel) === normalize(u2.skillLevel)) {
    score += 30;
  }

  if (normalize(u1.instrument) !==normalize(u2.instrument)) {
    score += 20;
  }else{
    score += 5;
  }

  if (normalize(u1.availablity) ===normalize(u2.availablity)) {
    score += 10;
  }

  return score;
};

export {calculateScore};
