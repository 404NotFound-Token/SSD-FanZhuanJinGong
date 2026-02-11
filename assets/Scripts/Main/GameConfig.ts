import { Archer } from "../Combat/Actor/Archer"

/**
 * 敌人塔配置
 * MainCity: 主城
 * Tower1: 炮塔1
 * Tower2: 炮塔2
 * ArrowTower1: 箭塔1
 * ArrowTower2: 箭塔2
 * ArrowTower3: 箭塔3
 */
export const EnemyTowerConfig = {
    MainCity: {
        HP: 1000, //塔血量
        AttackRange: 10, //攻击范围
        AttackInterval: 1, //攻击间隔
        AttackDamage: 10, // 攻击伤害
        loadInterval: 0.5, // 单个间隔
        batchInterval: 10, // 批次间隔
    },
    Tower1: {
        HP: 100,
        AttackRange: 10,
        AttackInterval: 1,
        AttackDamage: 10,
        loadInterval: 0.5,
        batchInterval: 10,
    },
    Tower2: {
        HP: 100,
        AttackRange: 10,
        AttackInterval: 1,
        AttackDamage: 10,
        loadInterval: 0.5,
    },

    // 箭塔比较特殊 它没有攻击方式 修改伤害请修改弓箭手的数值
    ArrowTower1: {
        HP: 100,
    },
    ArrowTower2: {
        HP: 100,
    },
    ArrowTower3: {
        HP: 100,
    }
}

/**
 * Tower1: OurTower1
 * Tower2: OurTower2
 * Tower3: OurTower3
 * Tower4: OurTower4
 * Tower5: OurTower5
 * Tower6: OurTower6
 */
export const OurTowerConfig = {
    Tower1: {
        HP: 100,
        AttackRange: 10,
        AttackInterval: 1,
        AttackDamage: 10,
        loadInterval: 0.5,
        batchInterval: 10,
    },
    Tower2: {
        HP: 100,
        AttackRange: 10,
        AttackInterval: 1,
        AttackDamage: 10,
        loadInterval: 0.5,
        batchInterval: 10,
    },
    Tower3: {
        HP: 100,
        AttackRange: 10,
        AttackInterval: 1,
        AttackDamage: 10,
        loadInterval: 0.5,
        batchInterval: 10,
    },
    Tower4: {
        HP: 100,
        AttackRange: 10,
        AttackInterval: 1,
        AttackDamage: 10,
        loadInterval: 0.5,
        batchInterval: 10,
    },
    Tower5: {
        HP: 100,
        AttackRange: 10,
        AttackInterval: 1,
        AttackDamage: 10,
        loadInterval: 0.5,
        batchInterval: 10,
    },
    Tower6: {
        HP: 100,
        AttackRange: 10,
        AttackInterval: 1,
        AttackDamage: 10,
        loadInterval: 0.5,
        batchInterval: 10,
    },
}

/**
 * 我方角色配置
 */
export const OurActorConfig = {
    Axe: { // 斧头
        HP: 100, //角色血量
        Speed: 5, // 角色速度
        AttackRange: 10, // 攻击范围
        AttackInterval: 1, // 攻击间隔
        AttackDamage: 10, // 攻击伤害
    },
    Shield: { // 盾牌
        HP: 100, //角色血量
        Speed: 5, // 角色速度
        AttackRange: 10, // 攻击范围
        AttackInterval: 1, // 攻击间隔
        AttackDamage: 10, // 攻击伤害
    },
    Sword: { // 剑
        HP: 100, //角色血量
        Speed: 5, // 角色速度
        AttackRange: 10, // 攻击范围
        AttackInterval: 1, // 攻击间隔
        AttackDamage: 10, // 攻击伤害
    }
}

/**
 * 敌人角色配置
 */
export const EnemyActorConfig = {
    Default: { // 默认
        HP: 100, //角色血量
        Speed: 5, // 角色速度
        AttackRange: 10, // 攻击范围
        AttackInterval: 1, // 攻击间隔
        AttackDamage: 10, // 攻击伤害
    },
    Archer: { //弓箭手
        AttackDamage: 10,
        AttackRange: 10,
    }
}