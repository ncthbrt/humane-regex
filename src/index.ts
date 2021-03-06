import { A, L, O } from 'ts-toolbelt';

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


type OneOf<T> = A.Compute<{ [K in keyof T]: { [K1 in K]: T[K] } & ({ [K2 in Exclude<keyof T, K>]: void }) }[keyof T]>;

type Ast<Tokens extends (Named & Codec)[]> =
    A.Compute<{ [Value in Tokens[Exclude<keyof Tokens, keyof []>]as ExtractName<Value>]: ExtractType<Value> }>;


function either<Codecs extends [Named & Codec, ...Named & Codec[]]>(...codecs: [...Codecs]): Nameable<Codec<OneOf<Ast<Codecs>>>> {
    // return nameable({

    // });
}

function maybe<C extends Codec>(codec: C): Nameable<Codec<null | ExtractType<C>>> {

}

function sequence<C extends Codec>(codec: C): Nameable<Codec<ExtractType<C>[]>> {

}


function nonEmptySequence<C extends Codec>(codec: C): Nameable<Codec<[ExtractType<C>, ...ExtractType<C>[]]>> {

}

function regex<Tokens extends Codec[]>(strings: TemplateStringsArray, ...values: [...Tokens]): Nameable<Codec<Ast<L.Select<Tokens, Named & Codec>>>> {
}

function whitespace() {

}


const ws = regex`\s+`;
const maybeWs = maybe(ws);
const declaration = regex`let${ws}${identifier('id')}${maybeWs}=${maybeWs}${stringLiteral('value')}${maybeWs};`;
const primitive = either(integer('integer'), stringLiteral('string'));
const assignment = regex`${ws}${identifier('id')}${ws}=${ws}${primitive('value')}${ws};`;
const expression = nonEmptySequence(either(assignment('assignment'), declaration('declaration')));

