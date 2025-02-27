export function typed<Type>(): Type;
export function typed<Type>(def: Type) : Type;
export function typed(def?: any) {
    return def;
}


export function getPrefixes(arr: string[]) {
    const prefixes = new Set<string>();
    let last: string | undefined;
    for (const str of arr) {
        for (let i = 4; i <= str.length; i++) {

            let prefix = str.substring(0, i);
            if(prefix.endsWith("-")) prefix = prefix.substring(0, prefix.length - 1);

            if(last) {
                const newMatches = countPrefixMatches(prefix, arr);
                const lastMatches = countPrefixMatches(last, arr);

                if(newMatches >= lastMatches) prefixes.delete(last);
                if(newMatches < lastMatches) continue;
            }


            prefixes.add(prefix);
            last = prefix;
        }
        last = undefined;
    }
    return Array.from(prefixes)
        .map(prefix => ({prefix, matches: countPrefixMatches(prefix, arr)}));
}

function countPrefixMatches(prefix: string, arr: string[]) {
    let count = 0;
    for (let string of arr) {
        if(string.startsWith(prefix)) count++;
    }
    return count;
}