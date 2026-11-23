/** Every claim in the story points at one of these. */
export const SOURCES = {
  veritasium: {
    short: 'Veritasium (2023)',
    full: 'Veritasium (2023). What game theory reveals about life, the universe, and everything [Video]. YouTube.',
    url: 'https://youtu.be/mScpHTIi-kM',
  },
  flood: {
    short: 'Flood (1958)',
    full: 'Flood, M. M. (1958). Some experimental games. Management Science, 5(1), 5–26. First circulated as RAND RM-789-1 (1952).',
  },
  poundstone: {
    short: 'Poundstone (1992)',
    full: 'Poundstone, W. (1992). Prisoner’s Dilemma: John von Neumann, game theory, and the puzzle of the bomb. Doubleday.',
  },
  nash: {
    short: 'Nash (1950)',
    full: 'Nash, J. F. (1950). Equilibrium points in n-person games. Proceedings of the National Academy of Sciences, 36(1), 48–49.',
  },
  luceRaiffa: {
    short: 'Luce & Raiffa (1957)',
    full: 'Luce, R. D., & Raiffa, H. (1957). Games and Decisions: Introduction and Critical Survey. Wiley.',
  },
  trivers: {
    short: 'Trivers (1971)',
    full: 'Trivers, R. L. (1971). The evolution of reciprocal altruism. The Quarterly Review of Biology, 46(1), 35–57.',
  },
  hart: {
    short: 'Hart & Hart (1992)',
    full: 'Hart, B. L., & Hart, L. A. (1992). Reciprocal allogrooming in impala, Aepyceros melampus. Animal Behaviour, 44(6), 1073–1083.',
  },
  wilkinson: {
    short: 'Wilkinson (1984)',
    full: 'Wilkinson, G. S. (1984). Reciprocal food sharing in the vampire bat. Nature, 308, 181–184.',
  },
  axelrod80a: {
    short: 'Axelrod (1980a)',
    full: 'Axelrod, R. (1980). Effective choice in the Prisoner’s Dilemma. Journal of Conflict Resolution, 24(1), 3–25.',
  },
  axelrod80b: {
    short: 'Axelrod (1980b)',
    full: 'Axelrod, R. (1980). More effective choice in the Prisoner’s Dilemma. Journal of Conflict Resolution, 24(3), 379–403.',
  },
  axelrodHamilton: {
    short: 'Axelrod & Hamilton (1981)',
    full: 'Axelrod, R., & Hamilton, W. D. (1981). The evolution of cooperation. Science, 211(4489), 1390–1396.',
  },
  axelrod84: {
    short: 'Axelrod (1984)',
    full: 'Axelrod, R. (1984). The Evolution of Cooperation. Basic Books.',
  },
  nowakMay: {
    short: 'Nowak & May (1992)',
    full: 'Nowak, M. A., & May, R. M. (1992). Evolutionary games and spatial chaos. Nature, 359, 826–829.',
  },
  molander: {
    short: 'Molander (1985)',
    full: 'Molander, P. (1985). The optimal level of generosity in a selfish, uncertain environment. Journal of Conflict Resolution, 29(4), 611–618.',
  },
  nowakSigmund92: {
    short: 'Nowak & Sigmund (1992)',
    full: 'Nowak, M. A., & Sigmund, K. (1992). Tit for tat in heterogeneous populations. Nature, 355, 250–253.',
  },
  nowakSigmund93: {
    short: 'Nowak & Sigmund (1993)',
    full: 'Nowak, M., & Sigmund, K. (1993). A strategy of win-stay, lose-shift that outperforms tit-for-tat in the Prisoner’s Dilemma game. Nature, 364, 56–58.',
  },
  wuAxelrod: {
    short: 'Wu & Axelrod (1995)',
    full: 'Wu, J., & Axelrod, R. (1995). How to cope with noise in the iterated prisoner’s dilemma. Journal of Conflict Resolution, 39(1), 183–189.',
  },
  hoffman: {
    short: 'Hoffman (1999)',
    full: 'Hoffman, D. (1999, February 10). “I had a funny feeling in my gut.” The Washington Post.',
  },
  norris: {
    short: 'Norris & Kristensen (2010)',
    full: 'Norris, R. S., & Kristensen, H. M. (2010). Global nuclear weapons inventories, 1945–2010. Bulletin of the Atomic Scientists, 66(4), 77–83.',
  },
} as const;

export type SourceId = keyof typeof SOURCES;
