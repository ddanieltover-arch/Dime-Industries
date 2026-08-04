import { BEGINNERS_GUIDE_PILLAR } from "../lib/cms/posts/beginners-guide-to-dime-carts.ts";
const words = BEGINNERS_GUIDE_PILLAR.body.trim().split(/\s+/).length;
console.log("pillar words", words);
