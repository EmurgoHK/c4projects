import { Mongo } from "meteor/mongo";

export const News = new Mongo.Collection("news");

News.friendlySlugs({
  slugFrom: "headline",
  slugField: "slug",
  distinct: true,
  updateSlug: true,
  debug: false,
  transliteration: [
    {
      from: "ü",
      to: "u",
    },
    {
      from: "õö",
      to: "o",
    },
  ],
});
