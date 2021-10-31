Simple feedback bot using [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api).
# tg-bot 
##To run project
- create `.env`
- add `TOKEN`, `YOUR_ID`, `GROUP_ID_OF_YOUR_OPERATORS`, `MAIN_GROUP_ID`
- run `npm start`

# Folder Structure
## 
```
tg-bot
├── index.js  
|   
├── messages.js
|
└── queryList.js                   
```
`index.js` runs bot , contains all logic (you better divide logics and move to different files, if you are going to add more logic )

`queryList.js` `messages.js` - list of constants