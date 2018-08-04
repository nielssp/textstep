

export function test() {
    console.log('test');
}

TEXTSTEP.initLib('libtest', function (lib) {
    lib.export({
        test: test
    });
});
