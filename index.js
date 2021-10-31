const TelegramApi = require('node-telegram-bot-api')
const token = process.env.TOKEN
const me = process.env.YOUR_ID
const mygroup = process.env.GROUP_ID_OF_YOUR_OPERATORS
const mainGroup = process.env.MAIN_GROUP_ID
const info = require('./messages')
const QUERY_DATA_LIST = require('./queryList')

module.exports.startTGBot = function () {

    const bot = new TelegramApi(token, {polling: true})

    bot.setMyCommands([
        {command: '/courses', description: 'Barcha Kurslar'},
        {command: '/faq', description: 'Ko`p beriladigan savollar'},
    ])


    const courseListOptions = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'TOPIK II 읽기', callback_data: QUERY_DATA_LIST.INFO_READING}, {text: 'TOPIK II 듣기', callback_data: QUERY_DATA_LIST.INFO_LISTENING}],
                [{text: '쓰기 asoslari', callback_data: QUERY_DATA_LIST.INFO_WRITING0},{text: '쓰기 51-52', callback_data: QUERY_DATA_LIST.INFO_WRITING1}],
                [{text: '쓰기 60점 이상', callback_data: QUERY_DATA_LIST.INFO_WRITING2}],
            ]
        })
    }

    const startOptions = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Kurslar', callback_data: QUERY_DATA_LIST.COURSES},{text: 'FAQ', callback_data: QUERY_DATA_LIST.FAQ}],
            ]
        })
    }

    const operatorOption = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Operator bilan aloqa', callback_data: QUERY_DATA_LIST.OPERATOR}]
            ]
        })
    }

    const faqOptions = {
        reply_markup: JSON.stringify({
            inline_keyboard: info.messages.faq.map((e,i) => {
                return [{text: i+1, callback_data: e.id}]
            })
        })
    }

    const getFaqList = ( ) => {

        return info.messages.faq.map((e,i) => {
            return `${i+1}. ${e.question}\n`
        }).join('')

    }

    const sendFaqAnswer = (faqId)=> {
        let faq =  info.messages.faq.find(e => e.id === faqId)
        return `${faq.question} \n \n ${faq.answer}`

    }

    const getCourseOptions = (course) => {
        return {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: 'To`lov usuli', callback_data: QUERY_DATA_LIST[`PAYMENT_${course}`]}, {
                        text: 'Batafsil',
                        callback_data: QUERY_DATA_LIST[`DETAILS_${course}`]
                    }],
                    [{text: 'Kurs havolasi', url: info.links[course]}]
                ]
            })
        }
    }

    const getPayedOptions = (course) => {
        return {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: 'TO`LADIM', callback_data: QUERY_DATA_LIST[`PAYED_${course}`]}],
                    [{text: 'Operator bilan aloqa', callback_data: QUERY_DATA_LIST.OPERATOR}]
                ]
            })
        }
    }

    const getCourseDetailsOptions = (course) => {
        return {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: 'To`lov usuli', callback_data: QUERY_DATA_LIST[`PAYMENT_${course}`]}]
                ]
            })
        }
    }

    const getPaymentMethodOptions = (course) => {
        return {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: 'O`zbekistondaman', callback_data: QUERY_DATA_LIST[`PAYMENT_UZ_${course}`]}],
                    [{text: 'Koreyadaman', callback_data: QUERY_DATA_LIST[`PAYMENT_KR_${course}`]}]
                ]
            })
        }
    }



    bot.on('message', async msg => {
        const text = msg.text
        const chatId = msg.chat.id
        const firstName = msg.from.first_name || ''
        const lastName = msg.from.last_name || ''

        if(text === '/start') {
            //send welcome message
            await bot.sendMessage(chatId, `${firstName} ${lastName} Xush kelibsiz! Ushbu bot orqali siz Manjeom saytidagi kurslar haqida batafsil ma'lumot olib, kurslarni xarid qilishingiz mumkin!`)
            await bot.sendSticker(chatId,'CAACAgIAAxkBAAMaYSGyJhPIoJuLf1X4ECPI3Tcm3v8AAvcNAAJBw6hIAafA3KKmmK0gBA', startOptions)
        }
        if(text === '/courses' || text.toLowerCase() === 'kurslar') {
            await bot.sendMessage(chatId, info.messages.courseList)
            await bot.sendSticker(chatId,'CAACAgIAAxkBAAP6YSIQMfg7UGwhkWz3quSzeCFtJtsAAlYMAALSHNhIBqQ3Dr98_F4gBA', courseListOptions)
        }
        if(text === '/faq') {
            await bot.sendMessage(chatId, getFaqList(), faqOptions)
        }


        if(msg.photo) { //handle photo TODO: save link to your DB
            const fileId = msg.photo[msg.photo.length - 1].file_id;
            await bot.sendPhoto(me, fileId)
            await bot.sendMessage(me, msg.from.id)
            let link = await bot.getFileLink(fileId);
            console.log(link)
        }
        // Image as file type
        if (msg.document) {
            if (msg.document.mime_type.match('image')) {
                let link = await bot.getFileLink(msg.document.file_id);
                //  console.log(link)

                if (msg.caption) {
                    //console.log(`${msg.caption} ${link}`);
                } else {
                    //console.log(link);
                }
            }
        }

        //to get user email
        if(chatId != me && chatId != mygroup && chatId != mainGroup && !text.includes('/')) {
            if(text.includes('@')) {
                await bot.forwardMessage(me, chatId, msg.message_id)
            }
            else {
                await bot.forwardMessage(mainGroup, chatId, msg.message_id)
                return bot.forwardMessage(mygroup, chatId, msg.message_id)
            }
        }
        // if someone in your group replies to the message
        if(chatId == mygroup || chatId == mainGroup) {
            if(msg.reply_to_message) {
                text && await bot.sendMessage(msg.reply_to_message.forward_from.id, text)
                msg.sticker && await bot.sendSticker(msg.reply_to_message.forward_from.id, msg.sticker.file_id)
            }
        }
        // if someone you reply to bot's message in dm
        if(chatId == me) {
            if(msg.reply_to_message) {
                if(text.includes('#')) {
                    let email = msg.reply_to_message.text.split(" ").find(e => e.includes('@'))
                } else {
                    text && await bot.sendMessage(msg.reply_to_message.forward_from.id, text)
                    msg.sticker && await bot.sendSticker(msg.reply_to_message.forward_from.id, msg.sticker.file_id)
                }

            }
        }

    })

    bot.on('callback_query', async msg => {

        const chatId = msg.message.chat.id
        const data = msg.data
        if(data === QUERY_DATA_LIST.COURSES) {
            return bot.sendMessage(chatId, info.messages.courseList, courseListOptions)
        }
        if(data === QUERY_DATA_LIST.OPERATOR) {
            return bot.sendMessage(chatId, info.messages.operator)
        }
        if(data === QUERY_DATA_LIST.FAQ) {
            return bot.sendMessage(chatId, getFaqList(), faqOptions)
        }
        if(data.includes(QUERY_DATA_LIST.FAQ)){
            await bot.sendMessage(chatId,sendFaqAnswer(data))
            return bot.sendMessage(chatId, getFaqList(), faqOptions)
        }
        if( data.includes(QUERY_DATA_LIST.INFO)){
            return bot.sendMessage(chatId, info.messages[data.split('_')[1]].courseInfo, getCourseOptions(data.split('_')[1]))
        }
        if(data.includes(QUERY_DATA_LIST.PAYMENT_UZ)) {
            //handle payment in UZ
            return bot.sendMessage(chatId, info.messages[data.split('_')[2]].paymentUz, getPayedOptions(data.split('_')[2]))
        }
        if(data.includes(QUERY_DATA_LIST.PAYMENT_KR)) {
            //handle payment in KR
            return bot.sendMessage(chatId, info.messages[data.split('_')[2]].paymentKr, getPayedOptions(data.split('_')[2]))
        }
        if(data.includes(QUERY_DATA_LIST.PAYMENT)) {
            //handle payment methods
            return bot.sendMessage(chatId, info.messages.paymentMethod, getPaymentMethodOptions(data.split('_')[1]))
        }
        if(data.includes(QUERY_DATA_LIST.DETAILS)) {
            //handle details
            return bot.sendMessage(chatId, info.messages[data.split('_')[1]].details, getCourseDetailsOptions(data.split('_')[1]))
        }
        if(data.includes(QUERY_DATA_LIST.PAYED)) {
            //handle payed
            await bot.sendMessage(me, data)
            return bot.sendMessage(chatId, info.messages.payed, operatorOption)
        }
    })

}