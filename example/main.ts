import { getUserName } from "./child.ts";
import dayjs from "https://deno.land/x/deno_dayjs@v0.5.0/mod.ts";

const day = dayjs().format("YYYY-MM-DD HH:mm:ss");
console.log(day);

const text: string[] = ["hello world"];
console.log(text);

console.info(getUserName());

function O() {
    console.log("O");
}
O();