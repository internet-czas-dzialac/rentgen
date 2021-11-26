import ExtendedRequest from "./extended-request";
import { StolenDataEntry } from "./stolen-data-entry";
import { flattenObject, maskString } from "./util";

console.log(flattenObject({ a: { b: { c: [1, 2, 3] } } }));

console.log(maskString("abcdefghijklmnopqrstuvwxyz", 1 / 3, 5));

console.log(maskString("abcdefghijklmnopqrstuvwxyz", 1, 30));

console.log(
  StolenDataEntry.parseValue(
    `[{"@context":"https://schema.org/","@type":"Product","image":["/medias/sys_master/root/images/h95/h8b/10873724928030/oppo-reno6-black-front.png","/medias/sys_master/root/images/h15/hb9/10873725681694/oppo-reno6-black-side.png","/medias/sys_master/root/images/hf8/h81/10873728729118/oppo-reno6-black-back.png"],"description":"OPPO Reno6 5G bez umowy lub w abonamencie w sklepie Orange. Zamów do domu lub odbierz w salonie w 24h. Transport gratis!","sku":"1100027218","brand":{"@type":"Thing","name":"OPPO"},"offers":{"@type":"Offer","priceCurrency":"PLN","priceValidUntil":"2099-12-31T00:00:00","itemCondition":"https://schema.org/UsedCondition","availability":"https://schema.org/InStock","url":"/esklep/smartfony/oppo/oppo-reno6-5g","seller":{"@type":"Organization","name":"Orange Polska S.A"},"price":"2199"},"name":"OPPO Reno6 5G"},{"@context":"http://schema.org/","@type":"Product","name":"OPPO Reno6 5G","description":"null","offers":{"@type":"Offer","priceCurrency":"PLN","price":"1248.00"}}]`
  )
);
