import { A, L } from 'ts-toolbelt';

type Result<T> =
    | { ok: T, error?: void }
    | { error: true, message?: string, ok?: void };


type Named<Name extends string = string> = {
    name: Name
};


type Decoder<Type> = (blob: string) => Result<Type>;
type Encoder<Type> = (value: Type) => string;

interface Codec<Type = any> {
    decoder: Decoder<Type>,
    encoder: Encoder<Type>
};

interface RegexpCodec<Type = any> extends Codec<Type> {
    pattern: RegExp
}

type Nameable<Type> = Type & {
    name: void
    <Name extends string>(name: Name): Named<Name> & Type
}



function nameable<T extends Codec>(codec: T): Nameable<T> {
    function f<Name extends string>(this: T, name: Name) {
        return Object.assign({ name }, codec);
    };
    return Object.assign(f, codec) as Nameable<T>;
}

const integer = nameable<RegexpCodec<number>>({
    pattern: /-?(([1-9][0-9]+) | [0-9])/,
    decoder: (value: string) => {
        const n = Number(value);
        if (Number.NaN !== n) {
            return { ok: n! };
        } else {
            return { error: true, message: 'NaN' };
        }
    },
    encoder: (number: number) => `${number | 0}`
});


const stringLiteral = nameable({
    pattern: /"([^"]|\\")*"/,
    decoder: (value: string) => ({
        ok: value.substring(1, value.length - 1).replace('\\"', '"')
    }),
    encoder: (str: string) => `"${str.replace('"', '\\"')}"`
});

const identifier = nameable({
    pattern: /[_a-zA-Z][_a-zA-Z0-9]*/,
    decoder: (value: string) => ({ ok: value }),
    encoder: (str: string) => str
})

type ExtractName<T> = T extends Named<infer Name> ? Name : never;
type ExtractType<T> = T extends Codec<infer Type> ? Type : never;



type Ast<Tokens extends (Named & Codec)[]> =
    A.Compute<{ [Value in Tokens[Exclude<keyof Tokens, keyof []>]as ExtractName<Value>]: ExtractType<Value> }>;


function either<Codecs extends [Named & Codec, ...Named & Codec[]]>(...codecs: [...Codecs]): Nameable<Codec<Partial<Ast<Codecs>>>> {
    // return nameable({

    // });
}




function token<Tokens extends Codec[]>(strings: TemplateStringsArray, ...values: [...Tokens]): Nameable<Codec<Ast<L.Select<Tokens, Named & Codec>>>> {

}

type A = Nameable<Codec<Ast<L.Select<[], Named>>>>
const declaration = token`let\s+${identifier('id')}\s*=\s*${stringLiteral('value')}\s*;`;
const primitive = either(integer('integer'), stringLiteral('string'));
const assignment = token`\s*${identifier('id')}\s*=\s*${primitive('value')}\s*;`;

const r = assignment.decoder('hello');
const b = declaration.decoder('goodbye');

const result = assignment.decoder('hello');
const isOk = r.ok!;
