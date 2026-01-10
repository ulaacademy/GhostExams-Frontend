import mongoose from "mongoose";

const MONGO_URI =
  "mongodb+srv://ulaacademy:careless111@cluster.2vyqh.mongodb.net/ula1?retryWrites=true&w=majority&appName=Cluster";

const statsSchema = new mongoose.Schema({
  students2007: Number,
  students2008: Number,
  subscribers: Number,
  visitors: Number,
  lastUpdate: Date,
});

const Stats = mongoose.models.Stats || mongoose.model("Stats", statsSchema);

async function connectToDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

export default async function handler(req, res) {
  await connectToDB();

  let stats = await Stats.findOne();
  if (!stats) {
    stats = new Stats({
      students2007: 3333,
      students2008: 4561,
      subscribers: 5879,
      visitors: 9874,
      lastUpdate: new Date(),
    });
    await stats.save();
  }

  const now = new Date();
  const lastUpdateDate = new Date(stats.lastUpdate).toDateString();
  const todayDate = now.toDateString();

  // ✅ تحديث جميع الأعداد مرة واحدة كل 24 ساعة
  if (lastUpdateDate !== todayDate) {
    console.log(`✅ تحديث البيانات - ${now.toLocaleString()}`);

    stats.students2007 += 27;
    stats.students2008 += 33;
    stats.subscribers += 288;
    stats.visitors += 1440; // ✅ زيادة 1440 زائر كل 24 ساعة

    stats.lastUpdate = now;
    await stats.save();
  }

  res.status(200).json(stats);
}
