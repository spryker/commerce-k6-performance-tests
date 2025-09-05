export default class RandomUtil {
  static getRandomItem(data) {
    return data[Math.floor(Math.random() * data.length)];
  }
}
