> 这玩意估计不会和上游合并了
> 
> 反正也是自己用着玩（大雾）

# My Rust Better Neko Cat Music (MRBNCM)

使用纯 Rust 编写的更好的猫猫音乐扩展喵（雾）

## 编译

准备好 NodeJS 和 Rust 工具套件。

构建 JS 框架~~构建猫粮~~：
```bash
yarn
yarn build:dev
yarn build
```

构建本体~~构建猫猫~~：

```bash
cargo build -p betterncm-loader
cargo run -p betterncm-loader --example debug # 直接把猫猫放在大房子里跑哦
```

发行构建~~让猫猫变得更小~~：

```bash
cargo +nightly build --release -Z build-std=core,alloc,std,panic_abort -Z build-std-features=panic_immediate_abort --target i686-pc-windows-msvc -p betterncm-loader
cargo +nightly run --release -Z build-std=core,alloc,std,panic_abort -Z build-std-features=panic_immediate_abort --target i686-pc-windows-msvc -p betterncm-loader --example debug # 直接把猫猫放在大房子里跑哦
```
