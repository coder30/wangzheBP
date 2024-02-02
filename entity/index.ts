export enum RankId {
    /** 胜率 */
    tRank = 0,
    /** 强势期 */
    qiangshi = 1,
    /** 团战胜率 */
    // tuanzhanWinRate = 6,
    /** 场均输出 */
    output = 7,
    /** 打野经济 */
    money = 8,
    /** 分均经济 */
    moneyPerMin = 9,
    /** 承伤 */
    suffer = 10,
    /** 局均助攻 */
    assist = 11,
    /** 局均推塔 */
    towerNum = 12,
    /** 场均MVP */
    mvp = 13,
    /** 场均金牌 */
    goldPlay = 14,
}

export interface HeroInfo {
	heroId: number;
	heroName: string;
	heroIcon: string;
	jumpUrl: string;
	heroCareer: string;
}

export interface Hero {
	heroId: number;
	banRate: number;
	showRate: number;
	winRate: number;
	tRank: string;
	beginPhase: number;
	midPhase: number;
	endPhase: number;
	killNum: number;
	output: number;
	money: number;
	moneyPerMin: number;
	suffer: number;
	assist: number;
	towerDamage: number;
	towerNum: number;
	mvp: number;
	goldPlay: number;
	heroInfo: HeroInfo;
	pick: string;
	ban: string;
}