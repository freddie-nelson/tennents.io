import {
  RegExpMatcher,
  TextCensor,
  asteriskCensorStrategy,
  englishDataset,
  englishRecommendedTransformers,
  keepStartCensorStrategy,
} from "obscenity";

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const censor = new TextCensor().setStrategy(keepStartCensorStrategy(asteriskCensorStrategy()));

export function censorProfanity(s: string): string {
  const matches = matcher.getAllMatches(s);
  return censor.applyTo(s, matches);
}
