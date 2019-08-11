(() => {
  const start = new Date();
  const numSize = 500;
  const numOfLoops = 100;
  let maxCount = 0;
  let totalCount = 0;

  const findNum = () => {
    const pickedNumbers = [];
    const randNumbers = [];
    let count = 0;

    const getRandomNumber = () => {
      count++;
      const num = Math.floor((Math.random() * numSize) + 1);
      if (pickedNumbers.indexOf(num) < 0) pickedNumbers.push(num);
      // randNumbers.push(num);
    }

    while (pickedNumbers.length < numSize) {
      getRandomNumber();
    }

    totalCount += count;
    if (count > maxCount) maxCount = count;
    // console.log(randNumbers);
  };

  for (let i = 0; i < numOfLoops; i++) {
    findNum();
  }

  return {
    tc: totalCount,
    mc: maxCount,
    t: new Date() - start,
    nl: numOfLoops,
    ns: numSize,
  };
})();