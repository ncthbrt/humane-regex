
type Result<T> =
    | { ok: T, error?: void }
    | { error: true, message?: string, ok?: void };


interface NamedToken<Name extends string = string, Type = any> extends DecoderEncoderPair<Type> {
    name: Name
};

interface Token<Type = any> extends DecoderEncoderPair<Type> {
    name: void
    <Name extends string>(name: Name): NamedToken<Name, Type>
}

type Decoder<Type> = (blob: string) => Result<Type>;
type Encoder<Type> = (value: Type) => string;

interface DecoderEncoderPair<Type> {
    decoder: Decoder<Type>,
    encoder: Encoder<Type>
};

function make<T>(pair: DecoderEncoderPair<T>): Token<T> {
    function f<Name extends string>(this: DecoderEncoderPair<T>, name: Name) {
        return Object.assign({ name }, pair);
    };
    return Object.assign(f as Token<T>, pair);
}

const integer = make<number>({
    pattern: '-?(([1-9][0-9]+) | [0-9])',
    decoder: (value: string) => {
        const n = Number(value);
        if (Number.NaN !== n) {
            return { ok: n };
        } else {
            return { error: true, message: 'NaN' };
        }
    },
    encoder: (n: number) => `${(n | 0)}`
});






type SyntaxTree = {};
