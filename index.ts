import fs from 'fs';
import xlsx from 'xlsx';
import { RankId, Hero } from './entity/index.js';
import {getRankList, fetchDetail} from './cgi/index.js';
import jsonData from './bp/heroInfo.json' assert { type: "json" };
import { select, input } from '@inquirer/prompts';
import kzHeroList from './bp/extrainfo/kzInfo.json' assert { type: "json" };
import dfHeroList from './bp/extrainfo/dfInfo.json' assert { type: "json" };
import bkzHeroList from './bp/extrainfo/bkzInfo.json' assert { type: "json" };

enum Color {
    /** 蓝色方 */
    Bule = '蓝色',
    /** 红色方 */
    Red = '红色',
}

/** 英雄强度计算公式 */
const calcStrong = (winRate: number, showRate: number) => {
    return Math.pow(winRate, 2)*0.7 + Math.pow(showRate, 2)*0.3
}

enum Career {
    Tank = '坦克',
    Mage = '法师',
    Warrior = '战士',
    Shooter = '射手',
    Support = '辅助',
    Assassin = '刺客',
}

const cli = async ()=>{
    const selectColor = await select({
        message: '选择红色方或者蓝色方',
        choices: [
            {
                name: '蓝色',
                value: '蓝色',
            },
            {
                name: '红色',
                value: '红色',
            }
        ]
    })

    const banMap = new Set()
    const redPickMap = new Set()
    const bluePickMap = new Set()
    const redPickHeroCareer = [];
    const bluePickHeroCareer: Career[] = [];
    const heroList = Object.values(jsonData).sort((a, b)=>{ return b.banRate - a.banRate});

    const banHero = async () => {
        const topBan10 = heroList.slice(0, 10);
        let banTips = '当前ban率最高的十个英雄\r\n';
        topBan10.forEach(item=>{
            banTips += `${item.heroName} ${(item.banRate*100).toFixed(2)}%\r\n`
        })
        const blueFirstBanHeroName = await input({ message: `${banTips} 输入一个你要禁用的英雄名称` });
        const blueFirstBanHero = heroList.find(item=> {return item.heroName === blueFirstBanHeroName})
        banMap.add(blueFirstBanHero?.heroId)

        const redFirstBanHeroName = await input({ message: `输入第一个红色方禁用的英雄名称` });
        const redFirstBanHero = heroList.find(item=> {return item.heroName === redFirstBanHeroName})
        banMap.add(redFirstBanHero?.heroId)
        const redSecondBanHeroName = await input({ message: `输入第二个红色方禁用的英雄名称` });
        const redSecondBanHero = heroList.find(item=> {return item.heroName === redSecondBanHeroName})
        banMap.add(redSecondBanHero?.heroId)

        const blueSecondBanHeroName = await input({ message: `输入第二个你要禁用的英雄名称` });
        const blueSecondBanHero = heroList.find(item=> {return item.heroName === blueSecondBanHeroName})
        banMap.add(blueSecondBanHero?.heroId)
        const blueThirdBanHeroName = await input({ message: `输入第三个你要禁用的英雄名称` });
        const blueThirdBanHero = heroList.find(item=> {return item.heroName === blueThirdBanHeroName})
        banMap.add(blueThirdBanHero?.heroId)

        const redThirdBanHeroName = await input({ message: `输入第三个红色方禁用的英雄名称` });
        const redThirdBanHero = heroList.find(item=> {return item.heroName === redThirdBanHeroName})
        banMap.add(redThirdBanHero?.heroId)
    }

    let pickTips = '当前胜率最高的十个英雄\r\n';

    // 设置蓝色方选择英雄的职业
    const setBluePickHeroCareer = (heroCareer: string)=> {
        if(heroCareer) {
            const career = heroCareer.split('/') as Career[];
            career.forEach((item: Career)=>{
                bluePickHeroCareer.push(item)
            })
        }
    }

    // 设置红色方选择英雄的职业
    const setRedPickHeroCareer = (heroCareer: string)=> {
        if(heroCareer) {
            const career = heroCareer.split('/') as Career[];
            career.forEach((item: Career)=>{
                redPickHeroCareer.push(item)
            })
        }
    }

    /** 获取克制英雄 */
    const getKzHero = (heroId: keyof typeof bkzHeroList) => {
        return bkzHeroList[heroId].map(item=> {return {heroName:item.szTitle, bkzParam: item.bkzParam * 100}})
    }

    /** 获取搭配的英雄 */
    const getDfHeroList = (heroId: keyof typeof dfHeroList) => {
        const pickHeroDfIdList = dfHeroList[heroId]?.map(item=>{return {heroId: item.dfHeroId2, dfParam: item.dfParam}})
        const pickHeroDf = pickHeroDfIdList?.map(item=>{return {heroName: jsonData[String(item.heroId) as keyof typeof jsonData].heroName, dfParam: item.dfParam}})
        return pickHeroDf;
    }

    /** 胜率超过50%，登场率超过5%的英雄强度列表 */
    const getPickTips = () => {
        pickTips = '当前胜率最高的十个英雄\r\n';
        const heroStrongList = heroList.filter(item=>{return !banMap.has(item.heroId)}).filter(item=> item.winRate>0.5 && item.showRate>0.05).sort((a, b)=> b.winRate - a.winRate);
        heroStrongList.filter(item=>!bluePickMap.has(item.heroId) && !redPickMap.has(item.heroId)).slice(0, 10).forEach(item=>{
            pickTips += `${item.heroName} ${(item.winRate*100).toFixed(2)}%\r\n`
        })
        return pickTips;
    }
    
    /** 蓝色方第一轮 pick */
    const blueFirstRoundPick = async ()=>{
        pickTips = getPickTips();

        const blueFirstPickHeroName = await input({ message: `${pickTips} 输入你要选择的第一个英雄名称` });
        const blueFirstPickHero = heroList.find(item=> {return item.heroName === blueFirstPickHeroName})
        const blueFirstPickHeroId = String(blueFirstPickHero?.heroId) as keyof typeof dfHeroList
        bluePickMap.add(Number(blueFirstPickHeroId))
        setBluePickHeroCareer(blueFirstPickHero?.heroCareer || '');
        return blueFirstPickHeroId;
    }

    /** 红色方第一轮 pick */
    const redFirstRoundPick = async () => {
        const redFirstPickHeroName = await input({ message: `输入第一个红色方选择的英雄名称` });
        const redFirstPickHero = heroList.find(item=> {return item.heroName === redFirstPickHeroName})
        const redFirstPickHeroId = String(redFirstPickHero?.heroId) as keyof typeof bkzHeroList
        redPickMap.add(Number(redFirstPickHeroId))
        setRedPickHeroCareer(redFirstPickHero?.heroCareer || '')

        const redSecondPickHeroName = await input({ message: `输入第二个红色方选择的英雄名称` });
        const redSecondPickHero = heroList.find(item=> {return item.heroName === redSecondPickHeroName})
        const redSecondPickHeroId = String(redSecondPickHero?.heroId) as keyof typeof bkzHeroList
        redPickMap.add(Number(redSecondPickHeroId))
        setRedPickHeroCareer(redSecondPickHero?.heroCareer || '')

        return [redFirstPickHeroId, redSecondPickHeroId]        
    }

    /** 蓝色方第二轮 pick */
    const blueSecondRoundPick = async () => {
        pickTips = getPickTips();

        const blueSecondPickHeroName = await input({ message: `${pickTips} 输入你要选择的第二个英雄名称` });
        const blueSecondPickHero = heroList.find(item=> {return item.heroName === blueSecondPickHeroName})
        const blueSecondPickHeroId = String(blueSecondPickHero?.heroId) as keyof typeof dfHeroList
        bluePickMap.add(Number(blueSecondPickHeroId))
        setBluePickHeroCareer(blueSecondPickHero?.heroCareer || '');

        const blueThirdPickHeroName = await input({ message: `输入你要选择的第三个英雄名称` });
        const blueThirdPickHero = heroList.find(item=> {return item.heroName === blueThirdPickHeroName})
        const blueThirdPickHeroId = String(blueThirdPickHero?.heroId) as keyof typeof dfHeroList
        bluePickMap.add(Number(blueThirdPickHeroId))
        setBluePickHeroCareer(blueThirdPickHero?.heroCareer || '');

        return [blueSecondPickHeroId, blueThirdPickHeroId]
    }

    /** 红色方第二轮 pick */
    const redSecondRoundPick = async () => {
        const redThirdPickHeroName = await input({ message: `输入第三个红色方选择的英雄名称` });
        const redThirdPickHero = heroList.find(item=> {return item.heroName === redThirdPickHeroName})
        const redThirdPickHeroId = String(redThirdPickHero?.heroId) as keyof typeof dfHeroList
        redPickMap.add(Number(redThirdPickHeroId))
        setRedPickHeroCareer(redThirdPickHero?.heroCareer || '')

        const redFourthPickHeroName = await input({ message: `输入第四个红色方选择的英雄名称` });
        const redFourthPickHero = heroList.find(item=> {return item.heroName === redFourthPickHeroName})
        const redFourthPickHeroId = String(redFourthPickHero?.heroId) as keyof typeof dfHeroList
        redPickMap.add(Number(redFourthPickHeroId))
        setRedPickHeroCareer(redFourthPickHero?.heroCareer || '')

        return [redThirdPickHeroId, redFourthPickHeroId]
    }

    /** 蓝色方第三轮 pick */
    const blueThirRoundPick = async () => {
        pickTips = getPickTips();

        const blueFourthPickHeroName = await input({ message: `${pickTips} 输入你要选择的第四个英雄名称` });
        const blueFourthPickHero = heroList.find(item=> {return item.heroName === blueFourthPickHeroName})
        const blueFourthPickHeroId = String(blueFourthPickHero?.heroId) as keyof typeof dfHeroList
        bluePickMap.add(Number(blueFourthPickHeroId))
        setBluePickHeroCareer(blueFourthPickHero?.heroCareer || '');

        const blueFifthPickHeroName = await input({ message: `输入你要选择的第五个英雄名称` });
        const blueFifthPickHero = heroList.find(item=> {return item.heroName === blueFifthPickHeroName})
        const blueFifthPickHeroId = String(blueFifthPickHero?.heroId) as keyof typeof dfHeroList
        bluePickMap.add(Number(blueFifthPickHeroId))
        setBluePickHeroCareer(blueFifthPickHero?.heroCareer || '');

        return [blueFourthPickHeroId, blueFifthPickHeroId]
    }

    /** 红色方第三轮 pick */
    const redThirRoundPick = async () => {
        const redFifthPickHeroName = await input({ message: `输入第五个红色方选择的英雄名称` });
        const redFifthPickHero = heroList.find(item=> {return item.heroName === redFifthPickHeroName})
        const redFifthPickHeroId = String(redFifthPickHero?.heroId) as keyof typeof dfHeroList
        redPickMap.add(Number(redFifthPickHeroId))
        setRedPickHeroCareer(redFifthPickHero?.heroCareer || '')

        return redFifthPickHeroId;
    }

    /** 坦克英雄列表(需要 2 个) */
    const tankHeroArr = [];
    /** 输出英雄列表（需要 3 个） */
    const outputHeroArr = [];
    /** 带线英雄列表（需要 1 个） */
    const laningHeroArr = [];
    /** 控制英雄列表（需要 2 个） */
    const controlHeroArr = [];
    
    const pickHero = async () => {        
        // 蓝色方第一轮 pick，选择一个英雄
        const blueFirstPickHeroId = await blueFirstRoundPick();
        // 红色方第一轮 pick，选择两个英雄
        const [redFirstPickHeroId, redSecondPickHeroId] = await redFirstRoundPick();

        // 根据蓝色方第一轮选择的英雄，推荐搭配的英雄
        const blueFirstPickHeroDf = getDfHeroList(blueFirstPickHeroId)
        console.log('myLog ~ file: index.ts:224 ~ pickHero ~ blueFirstPickHeroDf:', blueFirstPickHeroDf);

        // 根据红色方第一轮选择的英雄，推荐克制的英雄
        const redFirstPickHeroBkzHero = getKzHero(redFirstPickHeroId);
        const redSecondPickHeroBkzHero = getKzHero(redSecondPickHeroId);
        console.log('myLog ~ file: index.ts:227 ~ pickHero ~ redFirstPickHeroBkzHero:', redFirstPickHeroBkzHero);
        console.log('myLog ~ file: index.ts:229 ~ pickHero ~ redSecondPickHeroBkzHero:', redSecondPickHeroBkzHero);

        // 提示需要什么职业
        let needCareer = Object.values(Career).filter(item => !bluePickHeroCareer.includes(item))
        console.log('myLog ~ file: index.ts:129 ~ pickHero ~ needCareer:', needCareer);

        // 蓝色方第二轮 pick，选择两个英雄
        const [blueSecondPickHeroId, blueThirdPickHeroId] = await blueSecondRoundPick();
        // 红色方第二轮 pick，选择两个英雄
        const [redThirdPickHeroId, redFourthPickHeroId] = await redSecondRoundPick();

        // 根据蓝色方第二轮选择的英雄，推荐搭配的英雄
        const blueSecondPickHeroDf = getDfHeroList(blueSecondPickHeroId)
        const blueThirdPickHeroDf = getDfHeroList(blueThirdPickHeroId)
        console.log('myLog ~ file: index.ts:248 ~ pickHero ~ blueSecondPickHeroDf:', blueSecondPickHeroDf);
        console.log('myLog ~ file: index.ts:248 ~ pickHero ~ blueThirdPickHeroDf:', blueThirdPickHeroDf);

        // 根据红色方第二轮选择的英雄，推荐克制的英雄
        const redThirdPickHeroBkzHero = getKzHero(redThirdPickHeroId);
        const redFourthPickHeroBkzHero = getKzHero(redFourthPickHeroId);
        console.log('myLog ~ file: index.ts:252 ~ pickHero ~ redThirdPickHeroBkzHero:', redThirdPickHeroBkzHero);
        console.log('myLog ~ file: index.ts:254 ~ pickHero ~ redFourthPickHeroBkzHero:', redFourthPickHeroBkzHero);

        // 提示需要什么职业
        needCareer = Object.values(Career).filter(item => !bluePickHeroCareer.includes(item))
        console.log('myLog ~ file: index.ts:129 ~ pickHero ~ needCareer:', needCareer);

        // 蓝色方第三轮 pick，选择两个英雄
        const [blueFourthPickHeroId, blueFifthPickHeroId]= await blueThirRoundPick()
        // 红色方第三轮 pick，选择一个英雄
        const [redFifthPickHeroId] = await redThirRoundPick();

        console.log('myLog ~ file: index.ts:271 ~ pickHero ~ bluePickMap:', bluePickMap);
        console.log('myLog ~ file: index.ts:273 ~ pickHero ~ redPickMap:', redPickMap);

    }
    
    if(selectColor === Color.Bule) {
        // banHero()
        pickHero()
     }
    
}

cli()

/** 获取英雄信息 */
const getHeroInfo = async () => {
    let heroMap = {} as any;
    for(let id in RankId) {
        const idNum = Number(id)
        if(isNaN(idNum)) continue;
    
        const result = await getRankList(idNum);
        result.forEach((element: Hero) => {
            const {heroName, heroCareer} = element.heroInfo
            const heroStrong = calcStrong(element.winRate, element.showRate)
            const newElement = {heroName, heroCareer,heroStrong, ...element}
            if(!heroMap[element.heroId]) {
                heroMap[element.heroId] = newElement;
            } else {
                const formatData = Object.fromEntries(Object.entries(element).filter(([key, value]) => value && value !== '0'));
                heroMap[element.heroId] = {...heroMap[element.heroId], ...formatData};
            }
        });
        const heroInfo = JSON.stringify(heroMap, null, 4);
        fs.writeFile('./bp/heroInfo.json', heroInfo, null, ()=>{});
    }
}

// getHeroInfo()

/** 获取英雄额外信息（克制，被克制，双排，三排) */
const getheroextrainfo = async () => {
    let dfMap = {} as any;
    let tfMap = {} as any;
    let kzMap = {} as any;
    let bkzMap = {} as any;

    const heroIdList = Object.keys(jsonData);
    for(let i = 0; i < heroIdList.length; i++) {
        const data = await fetchDetail(Number(heroIdList[i]));
        dfMap[data.dfInfo.heroId] = data.dfInfo.list;
        tfMap[data.tfInfo.heroId] = data.tfInfo.list;
        kzMap[data.kzInfo.heroId] = data.kzInfo.list;
        bkzMap[data.bkzInfo.heroId] = data.bkzInfo.list;
    }
    
    const dfInfo = JSON.stringify(dfMap, null, 4);
    const tfInfo = JSON.stringify(tfMap, null, 4);
    const kzInfoString = JSON.stringify(kzMap, null, 4);
    const bkzInfoString = JSON.stringify(bkzMap, null, 4);
    
    fs.writeFile('./bp/extrainfo/tfInfo.json', tfInfo, null, ()=>{});
    fs.writeFile('./bp/extrainfo/dfInfo.json', dfInfo, null, ()=>{});
    fs.writeFile('./bp/extrainfo/kzInfo.json', kzInfoString, null, ()=>{});
    fs.writeFile('./bp/extrainfo/bkzInfo.json', bkzInfoString, null, ()=>{});
}

// getheroextrainfo()

/** 生成excel */
const createExcel = ()=>{
    const tempArr = Object.values(jsonData);

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(tempArr);
    
    // 将工作表添加到工作簿
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // 将工作簿写入到Excel文件
    xlsx.writeFile(workbook, 'output.xlsx');
}

// createExcel()

