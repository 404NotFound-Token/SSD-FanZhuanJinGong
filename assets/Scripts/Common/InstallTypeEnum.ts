
// 各厂家安装类型参考，此文件做个记录

/**
 * 上报数据 配置项说明：
 * logfile：日志文件名，对应不同厂家 
 * devid：开发者ID，pba等统计渠道上的应用ID
 * appid：游戏ID，发行/项目方名称
 * material：素材名称/试玩唯一id
 * nameTemplate：游戏名称模板
 * 例子：
{
	"logfile": "log_Google",
	"devid": "375a1860-f981-4229-bc74-14033ecc816d",
	"appid": "LW",
	"material": "双资源%F",
	"nameTemplate": "LW%D_双资源%F-试玩_闫泽斌_SHE%P_ALL"
}
 */

/**
 * 趣加
 * https://creative-playable.funplus.com/docs/analytics
 */
export enum InstallTypeFunPlus {
    None="None", //	直接跳转；渠道无法限制此行为
	Auto="Auto", //	自动跳转（如结束游戏）；渠道会根据策略决定是否允许跳转
	Induce="Induce", //	诱导跳转；渠道会根据策略决定是否允许跳转
	Global="Global", //	全局跳转；渠道会根据策略决定是否允许跳转
}

/**
 * 江娱
 * https://qianxian.feishu.cn/wiki/E5kawD6m2iJ3JxkwJzwcCK3hnue
 */
export enum InstallTypeRiveGame {
    next = 'next',                              //点击next跳转商店
    again = 'again',                            //点击again跳转商店
    download = 'download',                      //点击download跳转商店
    automatic_jump = 'automatic_jump',          //自动跳转商店
    select_skill = 'select_skill',              //选择技能跳转商店
    play_now = 'playnow',                      //点击领取跳转商店
}
