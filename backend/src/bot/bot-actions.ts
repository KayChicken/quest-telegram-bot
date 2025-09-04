// @ts-nocheck
import path, { dirname, join } from "path";
import TelegramBot, {
  InlineKeyboardMarkup,
  InputMedia,
  Message,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove
} from "node-telegram-bot-api";
import { telegramBOT } from "../server.js";
import { fileURLToPath } from "url";
import {
  createUser,
  getCurrentScoreByChatID,
  getUserByChatID,
  getUserNameByChatID,
  setEmailForUser,
  setStageByChatID,
  setUsernameByChatID,
  startTimeoutInDB,
  stopTimeoutInDB,
  upCurrentScoreNineStage
} from "../database/actions.js";

// Регулярное выражение для проверки email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const staticFilePath = join(process.cwd(), "public");
const __filename = fileURLToPath(import.meta.url);

const userStages: UserStages = {};
// Определяем тип для объекта stages
interface Stage {
  sendText: (chatID?: number) => Promise<string> | string;
  reply_markup?: ReplyKeyboardMarkup | ReplyKeyboardRemove | InlineKeyboardMarkup;
  before_image?: string;
  before_video_note?: string;
  before_video?: string;
  before_animation?: string;
  before_media_group?: InputMedia[];
  action: (msg: string, chatID?: number, photo?: TelegramBot.PhotoSize[]) => Promise<string> | string;
}

// Типизируем объект stages, который содержит различные стадии взаимодействия
const stages: Record<string, Stage> = {
  start: {
    sendText: () =>
      "Здравствуйте-здравствуйте! 👋\nМеня зовут Ирина, я реставратор живописи, специалист по иконографии и искусствовед, автор телеграм-канала <a href='https://t.me/ikona_v_kanone'>«Икона в каноне»</a> и обучающих программ по иконографии. Рада видеть вас здесь ❤️\n\n<b>Это бот-игра.</b> С его помощью вы проверите свои знания о Богородице, узнаете кое-что новое о Ее иконографии, и, конечно, получите от меня подарок!",
    before_image: "ira.JPG",
    reply_markup: {
      keyboard: [[{ text: "ДА, ЭТО ИНТЕРЕСНО!" }]],
      resize_keyboard: true,
      one_time_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_2-1";
    }
  },
  "stage_2-1": {
    sendText: () =>
      "Вас ждут 3 викторины и 2 задания, выполните их, чтобы оценить, на какой ступени своей собственной лествицы к Богу сейчас находитесь\n\nЗа каждое задание вам начислятся сердечки❤️, их вы сможете посчитать в боте. Множим любовь вместе!\n\nВы уже готовы начать?",
    before_video: "vse-stremimsya.mp4",
    reply_markup: {
      keyboard: [[{ text: "КОНЕЧНО!" }]],
      resize_keyboard: true
    },
    action: () => "stage_3-1"
  },

  "stage_3-1": {
    sendText: () => "Отлично! Как я могу к вам обращаться?\n\nНапишите, пожалуйста, своё имя 👇",
    reply_markup: {
      remove_keyboard: true
    },
    action: (msg, chatID) => {
      return setUsernameByChatID(chatID, msg).then(() => {
        return "stage_4-1";
      });
    }
  },

  "stage_4-1": {
    sendText: (chatID) => {
      return getUserNameByChatID(chatID).then((username) => {
        return `${username}, представьте, вы зашли в храм. Горят свечи, пахнет ладаном, мягко светится золото икон. Что вы в этот момент чувствуете?`;
      });
    },
    reply_markup: {
      keyboard: [[{ text: "Трепет" }], [{ text: "Волнение" }], [{ text: "Растерянность" }]],
      resize_keyboard: true
    },
    before_animation: "ira-gif.GIF",
    action: (msg, chatID) => {
      return "stage_5-1";
    }
  },

  "stage_5-1": {
    sendText: () => {
      return `Мы приходим в храм, чтобы обратиться к Отцу Небесному. Что мешает чувствовать себя в храме, как в отчем доме?🤔\n\nОтветьте на вопросы, чтобы разобраться`;
    },
    reply_markup: {
      keyboard: [[{ text: "Разберемся" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_6-1";
    }
  },

  "stage_6-1": {
    sendText: () => {
      return `Знаете ли вы, что такое иконостас?`;
    },
    reply_markup: {
      keyboard: [[{ text: "Да" }, { text: "Нет " }]],
      resize_keyboard: true
    },
    action: async (msg, chatID) => {
      msg.toLowerCase() === "да" ? await upCurrentScoreNineStage(chatID) : "";
      return "stage_6-2";
    }
  },

  "stage_6-2": {
    sendText: () => {
      return `Знаете ли вы, какую икону кладут на аналой?`;
    },
    reply_markup: {
      keyboard: [[{ text: "Да" }, { text: "Нет " }]],
      resize_keyboard: true
    },
    action: async (msg, chatID) => {
      msg.toLowerCase() === "да" ? await upCurrentScoreNineStage(chatID) : "";
      return "stage_6-3";
    }
  },

  "stage_6-3": {
    sendText: () => {
      return `Знаете ли вы, как по иконам определить, кому посвящен храм?`;
    },
    reply_markup: {
      keyboard: [[{ text: "Да" }, { text: "Нет " }]],
      resize_keyboard: true
    },
    action: async (msg, chatID) => {
      msg.toLowerCase() === "да" ? await upCurrentScoreNineStage(chatID) : "";
      return "stage_6-4";
    }
  },

  "stage_6-4": {
    sendText: () => {
      return `Знаете ли вы, где в иконостасе можно встретить образ Богородицы?`;
    },
    reply_markup: {
      keyboard: [[{ text: "Да" }, { text: "Нет " }]],
      resize_keyboard: true
    },
    action: async (msg, chatID) => {
      const score = await getCurrentScoreByChatID(chatID);
      return msg.toLocaleLowerCase() === "да" ? `stage_7-${score + 1}` : `stage_7-${score}`;
    }
  },

  "stage_7-0": {
    sendText: () => {
      return `Подведем итоги.\n\nВы набрали 0️⃣ положительных ответов. Это значит, что в храме вы можете чувствовать себя неуверенно.\n\n<b>Хотите узнать, почему нам важно чувствовать уверенность?</b>`;
    },
    reply_markup: {
      keyboard: [[{ text: "ПОЖАЛУЙ, ДА" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_8-1";
    }
  },

  "stage_7-1": {
    sendText: () => {
      return `Подведем итоги.\n\nВы набрали 1️⃣ положительный ответ. Это значит, что в храме вы можете чувствовать себя неуверенно.\n\n<b>Хотите узнать, почему нам важно чувствовать уверенность?</b>`;
    },
    reply_markup: {
      keyboard: [[{ text: "ПОЖАЛУЙ, ДА" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_8-1";
    }
  },

  "stage_7-2": {
    sendText: () => {
      return `Подведем итоги.\n\nВы набрали 2️⃣ положительных ответа. Это значит, что в храме вы можете чувствовать себя не очень уверенно.\n\n<b>Хотите узнать, почему нам важно чувствовать уверенность?</b>`;
    },
    reply_markup: {
      keyboard: [[{ text: "ПОЖАЛУЙ, ДА" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_8-1";
    }
  },

  "stage_7-3": {
    sendText: () => {
      return `Подведем итоги.\n\nВы набрали 3️⃣ положительных ответа. Это значит, что в храме вы можете чувствовать себя увереннее.\n\n<b>Хотите узнать, почему нам важно чувствовать уверенность?</b>`;
    },
    reply_markup: {
      keyboard: [[{ text: "ПОЖАЛУЙ, ДА" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_8-1";
    }
  },

  "stage_7-4": {
    sendText: () => {
      return `Подведем итоги.\n\nВы набрали 4️⃣ положительных ответа. Это значит, что в храме вы чувствуете себя уверенно.\n\n<b>Хотите узнать, почему нам важно чувствовать уверенность?</b>`;
    },
    reply_markup: {
      keyboard: [[{ text: "ПОЖАЛУЙ, ДА" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_8-1";
    }
  },

  "stage_8-1": {
    sendText: () => {
      return `Мы приходим в храм для молитвы, для близости к Господу. Поэтому, когда мы знаем ответы на простые вопросы, мы чувствуем себя как дома — спокойно, уверенно, комфортно🏠\n\nКогда вы закрываете базовые и получаете новые знания, у вас уходит лишнее напряжение, появляется расслабленность. Но даже не это самое главное.`;
    },
    reply_markup: {
      keyboard: [[{ text: "А ЧТО?" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_9-1";
    }
  },

  "stage_9-1": {
    sendText: () => "",
    before_video: "uznat.mp4",
    reply_markup: {
      keyboard: [[{ text: "КАК ЗДОРОВО!" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_10-1";
    }
  },

  "stage_10-1": {
    sendText: () =>
      `Для меня очень ценно, что вы готовы разделить со мной любовь к Богородице!\n\nА первая ступенечка пройдена — поздравляю, вы заработали 100 сердечек❤️!\n\nЗа ваши искренние ответы вы получаете 100 сердечек и переходите на следующую ступенечку!\n\nДвигаемся дальше?`,
    before_animation: "hearts.gif",
    reply_markup: {
      keyboard: [[{ text: "ДА!" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_12-1";
    }
  },

  "stage_12-1": {
    sendText: () =>
      "Все мы знаем, что не обязательно ждать сложностей, чтобы обратиться к Господу. Но часто обращаемся с молитвой к Нему или Богородице только когда что-то случилось.",
    reply_markup: {
      keyboard: [[{ text: "ДА, БЫВАЕТ" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_13-1";
    }
  },

  "stage_13-1": {
    sendText: () =>
      `Угадаете, перед каким образом Богородицы творить молитву в той или иной ситуации?\n\n<b>ЗАДАНИЕ:</b>\nВам будет появляться образ. Ваша задача - выбрать, в какой ситуации вы к нему подойдете.`,
    reply_markup: {
      keyboard: [[{ text: "ПРАВИЛА ПОНЯТНЫ, ИГРАЕМ" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_14-1";
    }
  },

  "stage_14-1": {
    sendText: () => "Икона Богородицы «Неупиваемая чаша»",
    before_image: "neupivaema-chasha.jpg",
    reply_markup: {
      keyboard: [
        [{ text: "БЛИЗКИЙ СТРАДАЕТ АЛКОГОЛИЗМОМ" }],
        [{ text: "ПРЕДСТОИТ СУД" }],
        [{ text: "СЛОЖНОСТИ В УЧЕБЕ" }]
      ],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_15-1";
    }
  },

  "stage_15-1": {
    sendText: () =>
      "Многие считают этот образ «иконой от пьянства». Но это не так — на иконе изображена не рюмка, а чаша причастия, и образ напоминает нам о главном христианском таинстве и Великой жертве Христовой.\n\nК слову, молиться перед иконой можно в любой жизненной ситуации, поэтому все ответы верные и неверные одновременно. А вы получаете 40 сердечек, за то, что разобрались❤️",
    reply_markup: {
      keyboard: [[{ text: "ЛЮБОПЫТНО" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_16-1";
    }
  },

  "stage_16-1": {
    sendText: () => "Икона Богородицы «Взыскание погибших»",
    before_image: "vziskanie-pogibshih.jpg",
    reply_markup: {
      keyboard: [
        [{ text: "ПОИСК БЕЗ ВЕСТИ ПРОПАВШИХ" }],
        [{ text: "МОЛИТВА ЗА УСОПШИХ" }],
        [{ text: "МОЛИТВА О СПАСЕНИИ БЛИЖНИХ" }]
      ],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return msg === "МОЛИТВА О СПАСЕНИИ БЛИЖНИХ" ? "stage_17-1" : "stage_17-2";
    }
  },

  "stage_17-1": {
    sendText: () =>
      "Верно! И вы получаете еще 40 сердечек❤️!\n\nПод «погибшими» здесь следует понимать не погибших людей, но «погибшие», то есть «заблудшие» души. Этот образ напоминает о молитве за близких и ходайтастве об их спасении",
    reply_markup: {
      keyboard: [[{ text: "ЭТО ИНТЕРЕСНО!" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_18-1";
    }
  },

  "stage_17-2": {
    sendText: () =>
      "Увы!\n\nПод «погибшими» здесь следует понимать не погибших людей, но «погибшие», то есть «заблудшие» души. Этот образ напоминает о молитве за близких и ходайтастве об их спасении\n\nА вам — 40 сердечек за любознательность❤️",
    reply_markup: {
      keyboard: [[{ text: "ЭТО ИНТЕРЕСНО!" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_18-1";
    }
  },

  "stage_18-1": {
    sendText: () => "Икона Богородицы Всецарица",
    before_image: "vse-carica.jpg",
    reply_markup: {
      keyboard: [[{ text: "СЕРЬЕЗНОЕ ЗАБОЛЕВАНИЕ" }], [{ text: "СПАСЕНИЕ БЛИЗКИХ" }], [{ text: "СЛОЖНОСТИ ЗАЧАТИЯ" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_19-1";
    }
  },

  "stage_19-1": {
    sendText: () =>
      "Верно! И вы получаете еще 40 сердечек❤️!\n\nА всё потому, что верны все варианты — к Царице Небесной, какой Богоматерь предстает в образе Всецарицы, мы можем обратиться с любой скорбью",
    reply_markup: {
      keyboard: [[{ text: "ТАК И ЕСТЬ!" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_20-1";
    }
  },

  "stage_20-1": {
    sendText: () => "",
    before_video: "laster.mp4",
    reply_markup: {
      keyboard: [[{ text: "ЗДОРОВО!" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_21-1";
    }
  },

  "stage_21-1": {
    sendText: () =>
      "Чтобы оценить, на какой ступени нашей условной «лестницы» вы сейчас, проверим, умеете ли вы читать икону\n\nИ, конечно, начислим сердечки за правильные ответы❤️!",
    reply_markup: {
      keyboard: [[{ text: "ПРОВЕРИМ" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_28-1";
    }
  },

  "stage_28-1": {
    sendText: () =>
      "На примере образов Богородицы вы уже убедились, что заложенный смысл помогут раскрыть лишь знания.\n\nЗнания дают понимание сути, а это, в свою очередь, — крепость веры, твердые шаги на пути к Спасению.\n\nГотовы узнать, много ли белых пятен в чтении иконы у вас есть?",
    reply_markup: {
      keyboard: [[{ text: "ГОТОВА(А)!" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_29-1";
    }
  },

  "stage_29-1": {
    sendText: () =>
      "<b>ЗАДАНИЕ:</b>\n\nЯ покажу вам фрагменты икон с вариантами названия целого изображения. А вы выберите ответ, который посчитаете правильным 🤗",
    reply_markup: {
      keyboard: [[{ text: "ПРАВИЛА ПОНЯТНЫ. ИГРАЕМ" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_30-1";
    }
  },

  "stage_30-1": {
    sendText: () => "Фрагмент какой иконы Богородицы вы видите?",
    before_image: "part-dostoyno-est.jpg",
    reply_markup: {
      keyboard: [
        [{ text: "«Достойно есть...»" }],
        [{ text: "Неопалимая Купина" }],
        [{ text: "Это образ собора архангела Гавриила" }]
      ],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return msg === "«Достойно есть...»" ? "stage_31-1" : "stage_31-2";
    }
  },

  "stage_31-1": {
    sendText: () =>
      "Правильный ответ! \nПоздравляю, вы заработали еще 80 сердечек ❤️\n\n Это фрагмент аллегорического гимнографическго изображения Богородицы «Достойно есть». Он иллюстрирует текст песнопения «Честне́йшую Херуви́м и сла́внейшую без сравне́ния Серафи́м»\n\nПоэтому здесь мы видим архангелов и прочие Небесные Силы",
    before_image: "dostoyno-est.jpg",
    reply_markup: {
      keyboard: [[{ text: "ИДЕМ ДАЛЬШЕ" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_32-1";
    }
  },

  "stage_31-2": {
    sendText: () =>
      "Белое пятно найдено!\n\nПеред вами фрагмент аллегорического гимнографическго изображения Богородицы «Достойно есть». Он иллюстрирует текст песнопения «Честне́йшую Херуви́м и сла́внейшую без сравне́ния Серафи́м»\n\nПоэтому здесь мы видим архангелов и прочие Небесные Силы\n\nНу а вы получаете еще 80 сердечек❤️, потому что узнали кое-то новое!",
    before_image: "dostoyno-est.jpg",
    reply_markup: {
      keyboard: [[{ text: "ИДЕМ ДАЛЬШЕ" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_32-1";
    }
  },

  "stage_32-1": {
    sendText: () => "Фрагмент какой фрески вы видите?",
    before_image: "part-marii.jpg",
    reply_markup: {
      keyboard: [
        [{ text: "ИСПЫТАНИЕ МАРИИ" }],
        [{ text: "ВВЕДЕНИЕ БОГОРОДИЦЫ ВО ХРАМ" }],
        [{ text: "ОБРУЧЕНИЕ МАРИИ" }]
      ],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return msg === "ОБРУЧЕНИЕ МАРИИ" ? "stage_33-1" : "stage_33-2";
    }
  },

  "stage_33-1": {
    sendText: () =>
      "Верно! Вы заработали еще 80 сердечек ❤️\n\nЭто фрагмент фрески протоевангельского (то есть до событий Евангелия) цикла, сюжет «Обручение Марии». Здесь первосвященник передает Марию святому Иосифу, выбранному среди других мужей.\n\nПодробно жизнеописание Девы Марии мы разбираем на курсе «Лествица в небо».",
    before_image: "marii.jpg",
    reply_markup: {
      keyboard: [[{ text: "КАК ИНТЕРЕСНО!" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_34-1";
    }
  },

  "stage_33-2": {
    sendText: () =>
      "Мы нашли белое пятно!\n\nЭто фрагмент фрески протоевангельского (то есть до событий Евангелия) цикла, сюжет «Обручение Марии». Здесь первосвященник передает Марию святому Иосифу, выбранному среди других мужей.\n\nПодробно жизнеописание Девы Марии мы разбираем на курсе «Лествица в небо».\n\nНу а вы получаете еще 80 сердечек❤️, потому что узнали кое-то новое!",
    before_image: "marii.jpg",
    reply_markup: {
      keyboard: [[{ text: "КАК ИНТЕРЕСНО!" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_34-1";
    }
  },

  "stage_34-1": {
    sendText: () => "Фрагмент какой иконы Богородицы вы видите?",
    before_image: "part-gora.jpg",
    reply_markup: {
      keyboard: [[{ text: "ВСЕЦАРИЦА" }], [{ text: "ВЕЛИЧИТ ДУША МОЯ..." }], [{ text: "ГОРА НЕРУКОСЕЧНАЯ" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return msg === "ГОРА НЕРУКОСЕЧНАЯ" ? "stage_35-1" : "stage_35-2";
    }
  },

  "stage_35-1": {
    sendText: () =>
      "Отлично!\n\nВы ответили верно и заработали 80 сердечек ❤️\n\nЭто фрагмент иконы Богородицы «Гора Нерукосечная» — здесь у Приснодевы облачные одежды, гора и лествица в руках, а вместо звезд приснодевства — красноликие ангелы. Почему все так, рассказываю на курсе «Лествица в небо».",
    before_image: "gora.jpg",
    reply_markup: {
      keyboard: [[{ text: "А ЧТО ДАЛЬШЕ?" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_36-1";
    }
  },

  "stage_35-2": {
    sendText: () =>
      "Оп! Белое пятно!\n\nЭто фрагмент иконы Богородицы «Гора Нерукосечная» — здесь у Приснодевы облачные одежды, гора и лествица в руках, а вместо звезд приснодевства — красноликие ангелы. Почему все так, рассказываю на курсе «Лествица в небо».\n\nНу а вы пока получаете 80 сердечек❤️, ведь теперь вы знаете, что это за икона!",
    before_image: "gora.jpg",
    reply_markup: {
      keyboard: [[{ text: "А ЧТО ДАЛЬШЕ?" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_36-1";
    }
  },

  "stage_36-1": {
    sendText: () =>
      "Вы набрали 240 сердечек за ответы на вопросы ❤️\n\nА также узнали, что образы Богородицы  — это не только Владимирская и Казанская.\n\nОбразы любимой нами Пречистой Девы могут рассказывать тексты, повествовать о Ее жизни, раскрывать главные христианские ценности — если научиться их понимать",
    before_animation: "hearts.gif",
    reply_markup: {
      keyboard: [[{ text: "И ЭТО ПРЕКРАСНО!" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_37-1";
    }
  },

  "stage_37-1": {
    sendText: () =>
      "Кстати, на курсе «Лествица в небо» вы👆\n\nА сердечки❤️, которые вы накопили, тоже кое в чем вам пригодятся...",
    before_media_group: [
      { media: path.resolve(staticFilePath, "./img/group_1.JPEG"), type: "photo" },
      { media: path.resolve(staticFilePath, "./img/group_2.JPEG"), type: "photo" },
      { media: path.resolve(staticFilePath, "./img/group_4.jpg"), type: "photo" },
      { media: path.resolve(staticFilePath, "./img/group_3.JPEG"), type: "photo" }
    ],
    reply_markup: {
      keyboard: [[{ text: "КАК?" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_39-1";
    }
  },

  "stage_39-1": {
    sendText: () =>
      "Только что вы прошли несколько ступенечек по своей личной лествице, узнали о Богородице чуть больше и сделали несколько шажочков в сторону Спасения.\n\nКурс «Лествица в небо» поможет вам понять Богородицу еще лучше и пройти сразу несколько десятков таких ступенек.",
    reply_markup: {
      keyboard: [[{ text: "А ГДЕ СЕРДЕЧКИ?" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_40-1";
    }
  },

  "stage_40-1": {
    sendText: () => "Сердечки можно обменять на промокод❤️!\n\nИ использовать его при оплате курса «Лествица в небо»",
    reply_markup: {
      keyboard: [[{ text: "ХОЧУ ПОЛУЧИТЬ ПРОМОКОД" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_41-1";
    }
  },

  "stage_41-1": {
    sendText: () =>
      "Чтобы получить промокод, выполните задание:\n\n<b>ЗАДАНИЕ:</b>\nрасскажите близким об этой викторине, чтобы каждый научился понимать образы Богородицы, как литургический предмет, полный духовного смысла.",
    reply_markup: {
      keyboard: [[{ text: "КАК ЭТО СДЕЛАТЬ?" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_41-2";
    }
  },

  "stage_41-2": {
    sendText: () =>
      "Как выполнить задание:\n1. Скачайте изображение\n2. Выложите его в любой из своих социальных сетей\n3. Отметьте @ikona_v_kanone\n4. Сделайте скриншот и пришлите его сюда",
    before_image: "template.jpg",
    reply_markup: {
      keyboard: [[{ text: "ВСЕ ЯСНО!" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_41-3";
    }
  },

  "stage_41-3": {
    sendText: async (chatID) => {
      startTimeoutInDB(
        chatID,
        "Без репоста не получится, а впереди самое интересное...\n\nЧтобы получить промокод, сделайте репост и пришлите его сюда❤️",
        {},
        10 * 1000 * 60
      );
      return "Сделайте репост и пришлите его сюда, а бот начислит вам сердечки❤️ и отправит промокод на скидку!";
    },
    reply_markup: {
      remove_keyboard: true,
      resize_keyboard: true
    },
    action: (msg, chatID, photo) => {
      return photo ? "stage_42" : "stage_41-3";
    }
  },

  stage_42: {
    sendText: (chatID) => {
      stopTimeoutInDB(chatID!);
      return "Поздравляю, за ваш комментарий вы получаете еще 380 сердечек❤️ и переходите на следующую ступенечку!\n\nИ еще 160 сердечек❤️ я дарю вам за то, что вы дошли до конца игры.";
    },
    before_animation: "hearts.gif",
    reply_markup: {
      keyboard: [[{ text: "ЗАБРАТЬ ПРОМОКОД" }]],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "stage_42-1";
    }
  },

  "stage_42-1": {
    sendText: async (chatID) => {
      startTimeoutInDB(
        chatID!,
        "А также подписывайтесь на мои социальные сети!\n\nДо встречи на курсе! 👋",
        {
          inline_keyboard: [
            [{ text: "ТГ-канал", url: "https://t.me/ikona_v_kanone" }],
            [
              {
                text: "INSTAGRAM",
                url: "https://www.instagram.com/ikona_v_kanone?igsh=MXd6OWVkYnd2amh4dQ%3D%3D&utm_source=qr"
              }
            ],
            [{ text: "САЙТ", url: "https://ikona-v-kanone.com/lestvica" }]
          ]
        },
        10 * 60 * 1000
      );
      const deleteMessage = await telegramBOT.sendMessage(chatID, "Загрузка...", {
        reply_markup: { remove_keyboard: true }
      });
      await telegramBOT.deleteMessage(chatID, deleteMessage.message_id);
      return "<b>Поздравляю, вы уже проделали огромный путь, посмотрите, сколько всего разобрали за 30 минут, а сколько еще впереди!\n\nПереходите на сайт https://ikona-v-kanone.com/lestvica, чтобы воспользоваться промокодом CHUDO, пока он не сгорел (до 23.09.2025)!</b>";
    },
    reply_markup: {
      inline_keyboard: [[{ text: "ПЕРЕЙТИ НА САЙТ", url: "https://ikona-v-kanone.com/lestvica" }]]
    },
    action: (msg, chatID) => {
      return "end";
    }
  },

  end: {
    sendText: (chatID) => {
      return "А также подписывайтесь на мои социальные сети!\n\nДо встречи на курсе! 👋";
    },
    reply_markup: {
      inline_keyboard: [
        [{ text: "ТГ-канал", url: "https://t.me/ikona_v_kanone" }],
        [
          {
            text: "INSTAGRAM",
            url: "https://www.instagram.com/ikona_v_kanone?igsh=MXd6OWVkYnd2amh4dQ%3D%3D&utm_source=qr"
          }
        ],
        [{ text: "САЙТ", url: "https://ikona-v-kanone.com/lestvica" }]
      ],
      resize_keyboard: true
    },
    action: (msg, chatID) => {
      return "end";
    }
  }
};

const sendMessage = async (chatID: number, currentStage: string, bot: TelegramBot): Promise<void> => {
  const stage = stages[currentStage];
  const stageTest = await stage.sendText(chatID);
  if (!stage) return;
  if (stage.before_media_group && stageTest) {
    const loadingMessage = await bot.sendMessage(chatID, "Загрузка...");
    const loadingMessageId = loadingMessage.message_id;
    await bot.sendMediaGroup(chatID, stage.before_media_group);
    await bot.deleteMessage(chatID, loadingMessageId);
  }
  if (stage.before_image && stageTest) {
    const loadingMessage = await bot.sendMessage(chatID, "Загрузка...");
    const loadingMessageId = loadingMessage.message_id;
    const imagePath = path.resolve(staticFilePath, `./img/${stage.before_image}`);
    await bot.sendPhoto(chatID, imagePath, {
      caption: stageTest,
      reply_markup: stage.reply_markup,
      parse_mode: "HTML"
    });
    await bot.deleteMessage(chatID, loadingMessageId);
    return;
  }
  if (stage.before_image) {
    const imagePath = path.resolve(staticFilePath, `./img/${stage.before_image}`);
    await bot.sendPhoto(chatID, imagePath, {
      reply_markup: stage.reply_markup
    });
  }
  if (stage.before_animation && stageTest) {
    const loadingMessage = await bot.sendMessage(chatID, "Загрузка...");
    const loadingMessageId = loadingMessage.message_id;
    const animationPath = path.resolve(staticFilePath, `./img/${stage.before_animation}`);
    await bot.sendAnimation(chatID, animationPath, {
      caption: stageTest,
      reply_markup: stage.reply_markup,
      parse_mode: "HTML"
    });
    await bot.deleteMessage(chatID, loadingMessageId);
    return;
  }
  if (stage.before_animation) {
    const animationPath = path.resolve(staticFilePath, `./img/${stage.before_animation}`);
    await bot.sendAnimation(chatID, animationPath);
  }
  if (stage.before_video_note) {
    const videoPath = path.resolve(staticFilePath, `./video/${stage.before_video_note}`);
    await bot.sendVideoNote(chatID, videoPath);
  }
  if (stage.before_video && stageTest) {
    const loadingMessage = await bot.sendMessage(chatID, "Загрузка...");
    const loadingMessageId = loadingMessage.message_id;
    const videoPath = path.resolve(staticFilePath, `./video/${stage.before_video}`);
    await bot.sendVideo(chatID, videoPath, {
      caption: stageTest,
      reply_markup: stage.reply_markup,
      parse_mode: "HTML"
    });
    await bot.deleteMessage(chatID, loadingMessageId);
    return;
  }
  if (stage.before_video) {
    const loadingMessage = await bot.sendMessage(chatID, "Загрузка...");
    const loadingMessageId = loadingMessage.message_id;
    const videoPath = path.resolve(staticFilePath, `./video/${stage.before_video}`);
    await bot.sendVideo(chatID, videoPath, {
      reply_markup: stage.reply_markup
    });
    await bot.deleteMessage(chatID, loadingMessageId);
  }
  if (stageTest) {
    await bot.sendMessage(chatID, stageTest, {
      reply_markup: stage.reply_markup,
      parse_mode: "HTML"
    });
  }
};

interface UserStages {
  [chatID: number]: {
    timeoutId?: NodeJS.Timeout;
  };
}

export const inizializationBOT = (): void => {
  telegramBOT.on("message", async (msg: Message) => {
    try {
      const chatID = msg.chat.id;
      const userMessage = msg.text?.trim() || "";
      const currentStage = await getUserByChatID(chatID);
      const photo = msg.photo;
      if (!currentStage) {
        const newUser = await createUser({
          chatID: chatID,
          stage: "start",
          stage_9_score: 0,
          username: "пользователь",
          email: "",
          created_at: new Date().toISOString()
        });
        if (!newUser) throw new Error("Не удалось создать пользователя");

        userStages[chatID] = {};

        await sendMessage(chatID, "start", telegramBOT);
      } else {
        const nextStage = await stages[currentStage.stage].action(userMessage, chatID, photo);

        await setStageByChatID(chatID, nextStage);

        await sendMessage(chatID, nextStage, telegramBOT);
      }
    } catch (error) {
      console.error(`Ошибка в обработке сообщения от пользователя ${msg.chat.id}:`, error);

      await telegramBOT.sendMessage(msg.chat.id, "Произошла ошибка. Пожалуйста, попробуйте позже.");
    }
  });
};
