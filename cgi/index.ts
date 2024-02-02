import axios from 'axios';

const headers = {
    'noencrypt': '1', 
    'host': 'kohcamp.qq.com', 
    'x-client-proto': 'https', 
    'Connection': "keep-alive",
    'ssoappid': 'campMiniProgram', 
    'ssoopenid': 'ydxcxs7L7R3fCki_X01nceahoCfs3alY', 
    'ssotoken': 'f-nF3MbqfpLiE8HZ_BXw-Ni52TAmko5l3GtD_seeNLBSstYPLBs_zeQh61BdzCkxFndGZma-3QNDQHzMYSonZt5KWc7aF8EnnShSSnqRAH8uEQBm9z-Ylgpo2gyXdb7G4Y42a9AIz8CtONFhXXrcunXZmLwmZvHpU1UnyIMAe7ZZVKxnDhoCkQFYW4GXM_VjMJyGBCmg1dMrnqQrSUFx8AwJNu4CYDXiG1gwBn8aYLMQT3wwwQy9ZNg69rH-kYOa', 
    'content-type': 'application/json', 
    'accept': 'application/json, text/plain, */*', 
    'accept-encrypt': '', 
    'ssobusinessid': 'mini', 
    'origin': 'https://camp.qq.com', 
    'x-requested-with': 'com.tencent.mm', 
    'sec-fetch-site': 'same-site', 
    'sec-fetch-mode': 'cors', 
    'sec-fetch-dest': 'empty', 
    'referer': 'https://camp.qq.com/', 
    'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
    'user-agent': 'Mozilla/5.0 (Linux; Android 14; PEEM00 Build/UKQ1.230924.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160065 MMWEBSDK/20231202 MMWEBID/9015 MicroMessenger/8.0.47.2560(0x28002F35) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx898cb4b08963dccb', 
}

export const getRankList = async (rankId: number) => {
    let data = JSON.stringify({"rankId":rankId,"position":0,"segment":3,"eId":null});
    
    let config = {
        data : data,
        method: 'post',
        headers: headers,
        maxBodyLength: Infinity,
        url: 'https://kohcamp.qq.com/hero/getdetailranklistbyid',
    };
    
    const response = await axios.request(config);
    if(response.data.returnCode) {
        console.log('myLog ~ fetchDetail ~ response.data.returnCode:', response.data.returnCode);
        return [];
    }
    return response.data.data.list;
}

export const fetchDetail = async (heroId: number)=>{
    let data = JSON.stringify({
        "heroId": heroId
    });
    
    let config = {
        data : data,
        method: 'post',
        headers: headers,
        maxBodyLength: Infinity,
        url: 'https://kohcamp.qq.com/hero/getheroextrainfo',
    };
    
    const response = await axios.request(config)
    if(response.data.returnCode) {
    console.log('myLog ~ fetchDetail ~ response.data.returnCode:', response.data.returnCode);
    return [];
    }
    const result = response.data.data;
    return result;
}