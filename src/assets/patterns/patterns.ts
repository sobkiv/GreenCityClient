export const Patterns = {
  linkPattern: /^$|^https?:\/\//,

  NamePattern: /^[ґҐіІєЄїЇА-Яа-яa-zA-Z](?!.*\.$)(?!.*?\.\.)(?!.*?\-\-)(?!.*?\'\')[-'ʼ’ ґҐіІєЄїЇА-Яа-я+\w.]{0,29}$/,
  TarifNamePattern: /^[ґҐіІєЄїЇА-Яа-яa-zA-Z](?!.*\.$)(?!.*?\.\.)(?!.*?)(?!.*?)[-'ʼ’ ґҐіІєЄїЇА-Яа-я+\w.]{0,255}$/,
  NameInfoPattern: /^[ґҐіІєЄїЇА-Яа-яa-zA-Z](?!.*?\ \ )(?!.*?\-\-)(?!.*?\'\')[^0-9!@#$%^&*()_+=₴`;:\\\[\],./~{}|"<>]{1,29}$/,
  regexpPass: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/,

  Base64Regex: /data:image\/([a-zA-Z]*);base64,([^"]*)/g,

  profileCityPattern: /^[іІєЄїЇёЁa-zA-Zа-яА-Я][іІєЄїЇёЁa-zA-Zа-яА-Я\-,’')(! ]*$/,

  ubsCorpusPattern: /^[A-Za-zА-Яа-яїЇіІєЄёЁ0-9]{0,4}$/,
  ubsHousePattern: /^[A-Za-zА-Яа-яїЇіІєЄёЁ0-9\-\\\/]+$/,
  ubsEntrNumPattern: /^([1-9]\d*)?$/,

  serteficatePattern: /(?!0000)\d{4}-(?!0000)\d{4}/,
  ubsCommentPattern: /[\S\s]{0,255}/,
  ordersPattern: /^\d{10}$/,
  orderEcoStorePattern: /^\d{0,8}$/,

  ubsMailPattern: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,

  paymantAmountPattern: '^[0-9]+(.[0-9]{1,2})?$',
  sertificateMonthCount: '^[0-9]{1,2}$',
  sertificateInitialValue: '^[0-9]{1,4}$',

  ubsPrice: /^\d*[.]?\d{0,2}$/,
  ubsServicePrice: /^\d*[.,]?\d{0,2}$/,
  ubsServiceBasicPrice: /^[0-9.,]{1,8}$/,

  ubsCityPattern: /^([a-zа-яїєґі ʼ'`ʹ-]){1,30}/iu,
  ubsWithDigitPattern: /^[іІєЄїЇёЁa-zA-Zа-яА-Я0-9][іІєЄїЇёЁa-zA-Zа-яА-Я0-9\-,.ʼ'`ʹ)(! ]*$/iu,
  ubsHouseNumberPattern: /^([a-zа-яїєґі0-9]([-,/]?))+$/iu,
  adminPhone: '^\\+?3?8?(0\\d{9})$'
};

export const Masks = {
  certificateMask: '0000-0000',
  ecoStoreMask: '0000000000',
  servicesMask: '000',
  phoneMask: '+{38\\0} (00) 000 00 00'
};
