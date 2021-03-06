let Sequelize = require('sequelize');
let sequelize = require('../config/sequelize');
let path = require('path');
let env = require('../config/env');

let model = require('../models/' + path.basename(__filename, '.js'));

let dao = {

    add: async function (addJson) {
        let data = await model.create(addJson,
            {
                logging: env.logging,
            }
        );
        return data;
    },

    delete: async function (id = null) {
        let data = await model.destroy({
            where: {
                id: id
            },
            logging: env.logging,
        });
        return data;
    },

    update: async function (updateJson = {}, whereJson = {}) {
        let data = await model.update(updateJson, {
            where: whereJson,
            logging: env.logging,
        });
        return data;
    },

    list: async function (whereJson = {}, page = 1, pageSize = 10) {
        let data = await model.findAndCountAll({
            logging: env.logging,
            where: whereJson,
            offset: pageSize * (page - 1),
            limit: pageSize
        });
        return data;
    },

    all: async function (whereJson = {}) {
        let data = await model.findAndCountAll({
            logging: env.logging,
            where: whereJson
        });
        return data;
    },

    sum: async function (cloum, whereJson) {
        let data = await model.sum(cloum, {
            where: whereJson
        });
        return data;
    },

    count: async function () {
        let data = await model.count({
            logging: env.logging
        });
        return data;
    },

    increment: async function (cloumArray = [], whereJson = {}, by = 1) {
        let data = await model.increment(cloumArray, {
            by: by,
            where: whereJson
        });
        return data;
    },

    // 关联查询，请仔细研究这里的写法
    list_with_author: async function (whereJson = {}, page = 1, pageSize = 10) {
        let data = await model.findAndCountAll({
            logging: env.logging,
            where: whereJson,
            offset: pageSize * (page - 1),
            limit: pageSize,
            include: [
                {
                    association: model.hasOne(require('../models/author'),
                        {
                            foreignKey: 'id', // author 表中的键 与 
                            targetKey: 'author_id' // book 表中的键 对应
                        }),
                    attributes: ['id', 'name', 'description']
                },
            ]
        });
        return data;
    },

    // 事务
    sale_an_author_book: async function (author_id) {

        let book = model;
        let author = require('../models/author');

        return new Promise(async (resolve, reject) => {

            sequelize.transaction(async function () {

                Promise.all([

                    await book.increment('sae_count', { where: { author_id } }),
                    await author.increment('sale_count', { where: { id: author_id } })

                ]).then(function () {
                    // 提交事务
                    resolve('success');
                });

            })
            .catch(function (error) {
                // 回滚事务

                reject(error);
            });

        });

    },

}


module.exports = dao;