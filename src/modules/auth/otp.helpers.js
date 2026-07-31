// Rejette les codes trop prévisibles :
// - tous les chiffres identiques (ex: 000000, 111111)
// - suite ascendante ou descendante (ex: 123456, 654321)
const isWeakCode = (code) => {
  if (/^(\d)\1+$/.test(code)) return true;

  let ascending = true;
  let descending = true;

  for (let i = 1; i < code.length; i++) {
    const prev = Number(code[i - 1]);
    const curr = Number(code[i]);
    if (curr !== prev + 1) ascending = false;
    if (curr !== prev - 1) descending = false;
  }

  return ascending || descending;
};

const generate = (length) => {
  let code;
  do {
    const num = Math.floor(Math.random() * 10 ** length);
    code = num.toString().padStart(length, "0");
  } while (isWeakCode(code));

  return code;
};

export const generateVerificationCode = async (length = 6, expiredMilliSeconds = 1 * 60 * 60 * 1000) => {
  const code = generate(length);
  const expiredAt = new Date(Date.now() + expiredMilliSeconds);

  return { code, expiredAt };
};
