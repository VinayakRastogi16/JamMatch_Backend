const normalizeArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(item =>
    typeof item === "string" ? item.toLowerCase().trim() : ""
  );
};

const hasCommon = (arr1, arr2) =>
  arr1.some(item => arr2.includes(item));

const calculateScore = (currentUser, otherUser) => {
  let score = 0;

  // 🎸 Instrument match
  if (hasCommon(currentUser.instruments, otherUser.instruments)) {
    score += 25;
  }

  // 🎧 Genre match
  if (hasCommon(currentUser.genres, otherUser.genres)) {
    score += 25;
  }

  // 🎯 Skill match
  if (currentUser.skillLevel === otherUser.skillLevel) {
    score += 20;
  }

  // ⏰ Availability match
  if (hasCommon(currentUser.availability, otherUser.availability)) {
    score += 15;
  }

  return score;
};

export { calculateScore };
