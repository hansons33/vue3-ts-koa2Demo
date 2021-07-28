import { Controller, Ctx, Body, Get, Flow, Post } from "koa-ts-controllers";
import {Context} from 'koa'
import {Personal} from '../validators/Personal'
import {Personal as PersonalModel} from '../models/Personal'
import Boom from '@hapi/boom'
import authorization from "../middlewares/authorization";
import { UserArticles as UserArticlesModel} from "../models/UserArticles";
import {UserArticles} from '../validators/UserArticles'



@Controller('/userInfo')
@Flow([authorization])
export class UserInfoController{

    /**
     * 获取用户的个人信息
     * 
     */
    @Get('/getData')
    async getData(
        @Ctx() ctx:Context,
    ) {
        let where = {
            username: ctx.userInfo.username
        }
        let personal = await PersonalModel.findOne({where})
        if (personal?.petName || personal?.introduction){
            ctx.status = 201
            return {
                code: '0',
                msg: '查询用户信息成功',
                data: personal
            }
        }else{
            ctx.status = 201
            return {
                code: '1',
                msg: '该用户未设置个人信息',
                data:{}
            }
        }
        
    }
    /**
     * 新增用户昵称和简介
     */
    @Post('/addData')
    async addData(
        @Ctx() ctx:Context,
        @Body() body: Personal
    ) {
        let {petName, introduction, imgUrl} = body
        console.log(petName, introduction)
        let personalInfo = await PersonalModel.findOne({
            where: {
                username: ctx.userInfo.username 
            }
        })
        if (personalInfo){
            personalInfo.petName = petName || personalInfo.petName
            personalInfo.introduction = introduction || personalInfo.introduction
            personalInfo.imgUrl = imgUrl || personalInfo.imgUrl
            await personalInfo.save();
            ctx.status = 201
            return {
                code:"0",
                msg: '添加成功',
                data:{}
            }
        }else{
            throw Boom.notFound('添加失败','用户信息出错')
        }
    }

    /**
     * 添加用户文章
     */
    @Post('/addArticle')
    async addArticle(
        @Ctx() ctx: Context,
        @Body() body: UserArticles
    ) {
        let {article, isEdit} = body
        let articleInfo = await UserArticlesModel.findOne({
            where:{
                username: ctx.userInfo.username 
            }
        })
        if (articleInfo?.articles){
            let articles = JSON.parse(articleInfo.articles)
            if (articles instanceof Array){
                if (articles.some(v=> v.title == article.title)){
                    if (!isEdit){
                        throw Boom.conflict('添加失败','已存在该标题的文章')
                    }else{
                        articles = articles.map(item=>{
                            if (item.title == article.title){
                                item = article
                            }
                            return item
                        })
                    }
                }else{
                    articles.push(article)
                }
                articleInfo.articles = JSON.stringify(articles)
                await articleInfo.save()
                ctx.status = 201
                return {
                    code:'0',
                    msg: '文章添加成功',
                    data: {
                        articleInfo
                    }
                    
                }
            }
        }else{
            throw Boom.notImplemented('未知错误','发生未知错误')
        }
    }

    /**
     * 获取用户文章
     */
    @Get('/getArticle')
    async getArticle(
        @Ctx() ctx: Context,
    ){
        let articleInfo = await UserArticlesModel.findOne({
            where:{
                username: ctx.userInfo.username
            }
        })
        if (articleInfo?.articles && JSON.parse(articleInfo.articles).length){
            ctx.status = 201
            return {
                code: '0',
                data: {
                    article: JSON.parse(articleInfo?.articles)
                }
            }
        }else{
            return {
                code: '1',
                msg: '啊哦，您现在还没有发布文章，快去发布吧！',
                data:{}
            }
        }
    }

    /**
     * 删除用户文章
     */
    @Post('/deleteArticle')
    async deleteArticle(
        @Ctx() ctx: Context,
        @Body() body: UserArticles
    ) {
        let {title} = body
        let articleInfo = await UserArticlesModel.findOne({
            where:{
                username: ctx.userInfo.username
            }
        })
        if (articleInfo?.articles){
            let articles = JSON.parse(articleInfo.articles)
            if (articles instanceof Array){
                articles = articles.filter(item=>item.title != title)
                articleInfo.articles = JSON.stringify(articles)
                await articleInfo.save()
                return {
                    code: '0',
                    msg: '文章删除成功',
                    data:{}
                }
            }
        }else{
            return {
                code: '1',
                msg: '未查到该用户的文章信息',
                data:{}
            }
        }
    }
}
