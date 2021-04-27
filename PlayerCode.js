module.exports = class PlayerCode {
  #Codes = [
    {
      id: 1,
      massage: {
        ar: "الستيج معطل ، فضلا قم بتفعيل الستيج لاستخدام البوت.",
        en: "Satge is disable, Enable Stage to use this bot.",
      },
    },
    {
      id: 2,
      massage: {
        ar: "الستيج ممتلئ او لا يوجد مكان متاح.",
        en: "Stage slots is Full or Locked.",
      },
    },
    {
      id: 3,
      massage: {
        ar: "جاري تشغيل : \n",
        en: "Playing : \n",
      },
    },
    {
      id: 4,
      massage: {
        ar: "(y) تمت اضافة مقطع الصوت : \n",
        en: "(y) song was add :\n",
      },
    },
    {
      id: 5,
      massage: {
        ar: "(n) لم نتمكن من إيجاد مقطع الصوت.",
        en: "(n) we can't Found this song.",
      },
    },
    {
      id: 6,
      massage: {
        ar: "قائمة الغرفة فارغة، استخدم !ر اضافة لاضافة مقطع صوت.",
        en: "Your list is empty, To add item use !r add.",
      },
    },
    {
      id: 7,
      massage: {
        ar: "لا يوجد المزيد من مقاطع الصوت في القائمة.",
        en: "No more songs in your list.",
      },
    },
    {
      id: 8,
      massage: {
        ar: "(y) تم إيقاف تشغيل مقطع الصوت",
        en: "(y) The song has finished playing",
      },
    },
    {
      id: 9,
      massage: {
        ar: "تم انهاء البوت ، شكرا لاستخدامك بوت ريثم.",
        en: "The bot has been ended, Thank you for useing Ryhem Bot.",
      },
    },
    {
      id: 10,
      massage: {
        ar: "لقد وصلت للحد الاقصى من عدد مقاطع الصوت اللتي يمكنك اضافتها.",
        en: "You have reached the maximum number of songs that you can add.",
      },
    },
    {
      id: 11,
      massage: {
        ar: "(y) تم حذف مقطع الصوت بنجاح",
        en: "(y) The song has been deleted successfully.",
      },
    },
    {
      id: 12,
      massage: {
        ar: "لم نتمكن من إيجاد مقطع صوت بهذا الرقم.",
        en: "We could not find a song with this index",
      },
    },
    {
      id: 13,
      massage: {
        ar: "الرجاء ادخال رقم مقطع الصوت بشكل صحيح.",
        en: "Please enter the song number correctly.",
      },
    },
    {
      id: 14,
      massage: {
        ar: "لا يوجد مقطع صوت قيد التشغيل.",
        en: "There is no song playing.",
      },
    },
    {
      id: 15,
      massage: {
        ar: "هناك مقطع قيد التشغيل، حاول مرة اخرى بعد استخدم !ر ايقاف.",
        en: "There is a song already playing, try again after using !r stop.",
      },
    },
    {
      id: 16,
      massage: {
        ar: "مقطع الصوت الحالي : \n",
        en: "Current song: \n",
      },
    },

    {
      id: 17,
      massage: {
        ar: "(y) تم مسح القائمة.",
        en: "(y) The list has been cleared.",
      },
    },
    {
      id: 18,
      massage: {
        ar: "لم يتم تشغيل البوت، استخدم !ر مساعدة للبدء.",
        en: "The bot did not start. Use !r help To start using this bot.",
      },
    },
    {
      id: 19,
      massage: {
        ar: "تم انهاء البوت، شكرا لاستخدامك بوت ريثم.",
        en: "The bot has been terminated, thanks for using the Rhythm bot.",
      },
    },
    {
      id: 20,
      massage: {
        ar: "الحد الاعلى لمقطع الصوت 20 دقيقة .",
        en: "Max durtion is 20 min.",
      },
    },
    {
      id: 21,
      massage: {
        ar: "جملة البحث قصيرة جدا لابد ان تكون 5 احرف على الاقل .",
        en: "Query text is too short. minmum 5 char.",
      },
    },
    {
      id: 22,
      massage: {
        ar: "تم مسح جميع ملفات الغرف .",
        en: "All groups file has been deleted.",
      },
    },
  ];

  getCode = (id, lang) => {
    let res = this.#Codes.filter((c) => c.id === id);
    return res[0].massage[lang];
  };
};
