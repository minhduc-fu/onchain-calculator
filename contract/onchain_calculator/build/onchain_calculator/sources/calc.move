module onchain_calculator::calc {
    use iota::object;
    use iota::object::UID;
    use iota::transfer;
    use iota::tx_context;

    const E_INVALID_OP: u64 = 1;
    const E_UNDERFLOW: u64 = 2;
    const E_DIV_BY_ZERO: u64 = 3;

    public struct Calculation has key, store {
        id: UID,
        owner: address,
        a: u64,
        b: u64,
        op: u8,
        result: u64,
    }

    #[allow(lint(self_transfer))]
    public fun calculate(a: u64, b: u64, op: u8, ctx: &mut tx_context::TxContext) {
        let sender = tx_context::sender(ctx);
        let result = compute(a, b, op);

        let calc = Calculation {
            id: object::new(ctx),
            owner: sender,
            a,
            b,
            op,
            result,
        };

        transfer::public_transfer(calc, sender);
    }

    fun compute(a: u64, b: u64, op: u8): u64 {
        if (op == 1) {
            a + b
        } else if (op == 2) {
            assert!(a >= b, E_UNDERFLOW);
            a - b
        } else if (op == 3) {
            a * b
        } else if (op == 4) {
            assert!(b > 0, E_DIV_BY_ZERO);
            a / b
        } else {
            abort E_INVALID_OP
        }
    }
}
