/**
 * Java 编程题目数据
 * 包含 30 道覆盖基础语法到算法的题目
 */

export const problems = [
    {
        id: 1,
        title: 'Hello World',
        difficulty: 'easy',
        tags: ['基础语法'],
        description: '编写一个 Java 程序，输出 `Hello, World!`。\n\n这是你的第一道 Java 编程题，让我们从最经典的程序开始吧！',
        examples: [{ input: '无', output: 'Hello, World!' }],
        templateCode: `public class Main {\n    public static void main(String[] args) {\n        // 在这里输出 Hello, World!\n        \n    }\n}`,
        testCases: [
            { checkType: 'contains', input: '无', expectedOutput: 'Hello, World!', requiredPatterns: ['System.out.println', 'Hello, World!'] }
        ],
        hints: ['使用 System.out.println() 方法来输出文本', '注意大小写和标点符号']
    },
    {
        id: 2,
        title: '变量声明与赋值',
        difficulty: 'easy',
        tags: ['基础语法', '变量'],
        description: '声明一个整数变量 `age` 并赋值为 `18`，然后声明一个字符串变量 `name` 赋值为 `"Java"`，最后输出：`My name is Java, I am 18 years old.`',
        examples: [{ input: '无', output: 'My name is Java, I am 18 years old.' }],
        templateCode: `public class Main {\n    public static void main(String[] args) {\n        // 声明变量并输出\n        \n    }\n}`,
        testCases: [
            { checkType: 'contains', input: '无', expectedOutput: 'My name is Java, I am 18 years old.', requiredPatterns: ['int', 'String', 'age', 'name', 'System.out'] }
        ],
        hints: ['使用 int 声明整数，String 声明字符串', '可以使用字符串拼接 + 来组合输出']
    },
    {
        id: 3,
        title: '数据类型转换',
        difficulty: 'easy',
        tags: ['基础语法', '类型转换'],
        description: '将一个 `double` 类型的变量 `price = 19.99` 转换为 `int` 类型并输出结果。然后将一个 `int` 类型的变量 `count = 42` 转换为 `double` 类型并输出。',
        examples: [{ input: '无', output: '19\n42.0' }],
        templateCode: `public class Main {\n    public static void main(String[] args) {\n        double price = 19.99;\n        int count = 42;\n        // 进行类型转换并输出\n        \n    }\n}`,
        testCases: [
            { checkType: 'contains', input: '无', expectedOutput: '19\n42.0', requiredPatterns: ['(int)', 'price', '(double)', 'count'] }
        ],
        hints: ['强制类型转换使用 (int) 或 (double)', '注意：double 转 int 会截断小数部分']
    },
    {
        id: 4,
        title: '条件判断 - 奇偶数',
        difficulty: 'easy',
        tags: ['条件语句'],
        description: '编写程序判断一个整数 `num = 7` 是奇数还是偶数。如果是偶数输出 `Even`，否则输出 `Odd`。',
        examples: [{ input: 'num = 7', output: 'Odd' }],
        templateCode: `public class Main {\n    public static void main(String[] args) {\n        int num = 7;\n        // 判断奇偶并输出\n        \n    }\n}`,
        testCases: [
            { checkType: 'structure', input: 'num = 7', expectedOutput: 'Odd', requiredStructure: [{ type: 'hasIfElse' }, { type: 'hasKeyword', keyword: '%' }] },
            { checkType: 'contains', input: 'num = 7', expectedOutput: 'Odd', requiredPatterns: ['if', '%', '2'] }
        ],
        hints: ['使用取模运算符 % 判断奇偶', 'num % 2 == 0 则为偶数']
    },
    {
        id: 5,
        title: 'Switch 语句 - 星期',
        difficulty: 'easy',
        tags: ['条件语句', 'switch'],
        description: '使用 `switch` 语句，根据变量 `day = 3` 输出对应的星期几（1=星期一，2=星期二 ... 7=星期日）。',
        examples: [{ input: 'day = 3', output: '星期三' }],
        templateCode: `public class Main {\n    public static void main(String[] args) {\n        int day = 3;\n        // 使用 switch 输出星期几\n        \n    }\n}`,
        testCases: [
            { checkType: 'contains', input: 'day = 3', expectedOutput: '星期三', requiredPatterns: ['switch', 'case', '星期三'] }
        ],
        hints: ['switch(day) 后跟 case 1: case 2: 等', '别忘了每个 case 后面的 break']
    },
    {
        id: 6,
        title: 'For 循环求和',
        difficulty: 'easy',
        tags: ['循环'],
        description: '使用 `for` 循环计算 1 到 100 的整数之和，并输出结果。',
        examples: [{ input: '无', output: '5050' }],
        templateCode: `public class Main {\n    public static void main(String[] args) {\n        // 使用 for 循环求 1+2+...+100\n        \n    }\n}`,
        testCases: [
            { checkType: 'contains', input: '无', expectedOutput: '5050', requiredPatterns: ['for', '5050'] }
        ],
        hints: ['定义一个 sum 变量，在循环中累加', '循环从 1 到 100（含）']
    },
    {
        id: 7,
        title: 'While 循环 - 阶乘',
        difficulty: 'easy',
        tags: ['循环'],
        description: '使用 `while` 循环计算 `10!`（10 的阶乘）并输出结果。',
        examples: [{ input: '无', output: '3628800' }],
        templateCode: `public class Main {\n    public static void main(String[] args) {\n        // 使用 while 循环计算 10!\n        \n    }\n}`,
        testCases: [
            { checkType: 'contains', input: '无', expectedOutput: '3628800', requiredPatterns: ['while', '3628800'] }
        ],
        hints: ['10! = 10 × 9 × 8 × ... × 1', '注意使用 long 类型避免溢出']
    },
    {
        id: 8,
        title: '数组遍历',
        difficulty: 'easy',
        tags: ['数组'],
        description: '定义一个整数数组 `{3, 7, 1, 9, 4, 6}`，遍历并找出最大值输出。',
        examples: [{ input: '无', output: '9' }],
        templateCode: `public class Main {\n    public static void main(String[] args) {\n        int[] arr = {3, 7, 1, 9, 4, 6};\n        // 找出最大值并输出\n        \n    }\n}`,
        testCases: [
            { checkType: 'contains', input: '无', expectedOutput: '9', requiredPatterns: ['for', 'arr'] },
            { checkType: 'structure', input: '无', expectedOutput: '9', requiredStructure: [{ type: 'hasLoop' }] }
        ],
        hints: ['先假设第一个元素是最大值', '遍历数组逐个比较']
    },
    {
        id: 9,
        title: '二维数组',
        difficulty: 'medium',
        tags: ['数组'],
        description: '创建一个 3×3 的二维数组表示矩阵：\n```\n1 2 3\n4 5 6\n7 8 9\n```\n计算对角线元素之和（1+5+9）并输出。',
        examples: [{ input: '无', output: '15' }],
        templateCode: `public class Main {\n    public static void main(String[] args) {\n        // 创建 3x3 矩阵并求对角线之和\n        \n    }\n}`,
        testCases: [
            { checkType: 'contains', input: '无', expectedOutput: '15', requiredPatterns: ['int[][]', '15'] }
        ],
        hints: ['对角线元素的行号和列号相同：matrix[i][i]']
    },
    {
        id: 10,
        title: '字符串反转',
        difficulty: 'easy',
        tags: ['字符串'],
        description: '编写程序将字符串 `"Hello Java"` 反转后输出。',
        examples: [{ input: '"Hello Java"', output: 'avaJ olleH' }],
        templateCode: `public class Main {\n    public static void main(String[] args) {\n        String str = "Hello Java";\n        // 反转字符串并输出\n        \n    }\n}`,
        testCases: [
            { checkType: 'contains', input: '"Hello Java"', expectedOutput: 'avaJ olleH', requiredPatterns: ['Hello Java'] }
        ],
        hints: ['可以使用 StringBuilder 的 reverse() 方法', '或者使用字符数组从后往前拼接']
    },
    {
        id: 11,
        title: '方法定义 - 求最大公约数',
        difficulty: 'medium',
        tags: ['方法', '算法'],
        description: '定义一个方法 `gcd(int a, int b)` 使用辗转相除法求两个整数的最大公约数。计算 `gcd(12, 18)` 并输出结果。',
        examples: [{ input: 'a=12, b=18', output: '6' }],
        templateCode: `public class Main {\n    // 定义 gcd 方法\n    \n    public static void main(String[] args) {\n        System.out.println(gcd(12, 18));\n    }\n}`,
        testCases: [
            { checkType: 'structure', input: 'a=12, b=18', expectedOutput: '6', requiredStructure: [{ type: 'hasMethod', name: 'gcd' }, { type: 'hasKeyword', keyword: '%' }] }
        ],
        hints: ['辗转相除法：gcd(a, b) = gcd(b, a % b)，当 b == 0 时返回 a']
    },
    {
        id: 12,
        title: '方法重载',
        difficulty: 'medium',
        tags: ['方法', 'OOP'],
        description: '定义三个重载的 `add` 方法：\n1. `add(int a, int b)` 返回两个整数之和\n2. `add(double a, double b)` 返回两个浮点数之和\n3. `add(int a, int b, int c)` 返回三个整数之和\n\n分别调用并输出结果。',
        examples: [{ input: '无', output: '3\n5.5\n6' }],
        templateCode: `public class Main {\n    // 定义三个重载的 add 方法\n    \n    public static void main(String[] args) {\n        System.out.println(add(1, 2));\n        System.out.println(add(2.5, 3.0));\n        System.out.println(add(1, 2, 3));\n    }\n}`,
        testCases: [
            { checkType: 'structure', input: '无', expectedOutput: '3\n5.5\n6', requiredStructure: [{ type: 'hasMethod', name: 'add' }, { type: 'hasKeyword', keyword: 'double' }] }
        ],
        hints: ['方法重载：方法名相同但参数不同']
    },
    {
        id: 13,
        title: '类与对象 - 学生类',
        difficulty: 'medium',
        tags: ['OOP', '类'],
        description: '定义一个 `Student` 类，包含属性 `name`（String）和 `score`（int），以及方法 `getGrade()` 返回等级（≥90 返回 "A"，≥80 返回 "B"，≥60 返回 "C"，否则 "D"）。\n\n创建一个学生对象 name="Tom", score=85，输出其等级。',
        examples: [{ input: 'name=Tom, score=85', output: 'B' }],
        templateCode: `// 定义 Student 类\nclass Student {\n    // 属性和方法\n    \n}\n\npublic class Main {\n    public static void main(String[] args) {\n        // 创建学生对象并输出等级\n        \n    }\n}`,
        testCases: [
            { checkType: 'structure', input: '无', expectedOutput: 'B', requiredStructure: [{ type: 'hasClass', name: 'Student' }, { type: 'hasMethod', name: 'getGrade' }, { type: 'hasIfElse' }] }
        ],
        hints: ['使用 if-else if 判断分数区间']
    },
    {
        id: 14,
        title: '继承 - 动物类',
        difficulty: 'medium',
        tags: ['OOP', '继承'],
        description: '定义基类 `Animal`（属性 `name`，方法 `speak()`），子类 `Dog` 重写 `speak()` 输出 `"Woof!"`，子类 `Cat` 重写 `speak()` 输出 `"Meow!"`。创建对象并调用。',
        examples: [{ input: '无', output: 'Woof!\nMeow!' }],
        templateCode: `class Animal {\n    String name;\n    void speak() {\n        System.out.println("...");\n    }\n}\n\n// 定义 Dog 和 Cat 子类\n\npublic class Main {\n    public static void main(String[] args) {\n        // 创建对象并调用 speak()\n        \n    }\n}`,
        testCases: [
            { checkType: 'structure', input: '无', expectedOutput: 'Woof!\nMeow!', requiredStructure: [{ type: 'hasClass', name: 'Dog' }, { type: 'hasClass', name: 'Cat' }, { type: 'hasKeyword', keyword: 'extends' }] }
        ],
        hints: ['子类使用 extends 关键字继承父类', '使用 @Override 注解重写方法']
    },
    {
        id: 15,
        title: '接口实现 - 可比较',
        difficulty: 'medium',
        tags: ['OOP', '接口'],
        description: '定义接口 `Comparable` 包含方法 `compareTo(int other)`，让 `Box` 类实现该接口（Box 有 `size` 属性）。比较两个 Box 并输出较大的那个的 size。',
        examples: [{ input: 'Box(10), Box(20)', output: '20' }],
        templateCode: `interface Comparable {\n    int compareTo(int other);\n}\n\n// 定义 Box 类实现接口\n\npublic class Main {\n    public static void main(String[] args) {\n        // 创建两个 Box 并比较\n        \n    }\n}`,
        testCases: [
            { checkType: 'structure', input: '无', expectedOutput: '20', requiredStructure: [{ type: 'hasClass', name: 'Box' }, { type: 'hasKeyword', keyword: 'implements' }] }
        ],
        hints: ['类用 implements 实现接口']
    },
    {
        id: 16,
        title: 'ArrayList 操作',
        difficulty: 'easy',
        tags: ['集合', 'ArrayList'],
        description: '创建一个 `ArrayList<String>`，添加 "Apple", "Banana", "Cherry"，然后删除 "Banana"，遍历输出剩余元素。',
        examples: [{ input: '无', output: 'Apple\nCherry' }],
        templateCode: `import java.util.ArrayList;\n\npublic class Main {\n    public static void main(String[] args) {\n        // 创建 ArrayList 并操作\n        \n    }\n}`,
        testCases: [
            { checkType: 'contains', input: '无', expectedOutput: 'Apple\nCherry', requiredPatterns: ['ArrayList', 'add', 'remove', 'Apple', 'Cherry'] }
        ],
        hints: ['使用 add() 添加，remove() 删除', '可以用 for-each 循环遍历']
    },
    {
        id: 17,
        title: 'HashMap 统计',
        difficulty: 'medium',
        tags: ['集合', 'HashMap'],
        description: '使用 `HashMap<String, Integer>` 统计字符串 `"hello world hello java hello"` 中每个单词出现的次数，并输出 `hello` 出现的次数。',
        examples: [{ input: '无', output: '3' }],
        templateCode: `import java.util.HashMap;\n\npublic class Main {\n    public static void main(String[] args) {\n        String text = "hello world hello java hello";\n        // 统计单词频率\n        \n    }\n}`,
        testCases: [
            { checkType: 'contains', input: '无', expectedOutput: '3', requiredPatterns: ['HashMap', 'split', 'hello'] }
        ],
        hints: ['使用 split(" ") 分割字符串', '用 getOrDefault() 简化计数逻辑']
    },
    {
        id: 18,
        title: 'Try-Catch 异常处理',
        difficulty: 'easy',
        tags: ['异常处理'],
        description: '编写一个除法程序，尝试计算 `10 / 0`，使用 try-catch 捕获 `ArithmeticException`，输出 `"Cannot divide by zero"`。',
        examples: [{ input: '10 / 0', output: 'Cannot divide by zero' }],
        templateCode: `public class Main {\n    public static void main(String[] args) {\n        // 使用 try-catch 处理除零异常\n        \n    }\n}`,
        testCases: [
            { checkType: 'contains', input: '无', expectedOutput: 'Cannot divide by zero', requiredPatterns: ['try', 'catch', 'ArithmeticException', 'Cannot divide by zero'] }
        ],
        hints: ['try { ... } catch (ArithmeticException e) { ... }']
    },
    {
        id: 19,
        title: '自定义异常',
        difficulty: 'medium',
        tags: ['异常处理', 'OOP'],
        description: '定义自定义异常 `AgeException`。编写方法 `checkAge(int age)`，当 age < 0 或 age > 150 时抛出 `AgeException`。测试传入 `-1` 并捕获输出异常信息。',
        examples: [{ input: 'age = -1', output: 'Invalid age: -1' }],
        templateCode: `// 定义 AgeException\n\npublic class Main {\n    static void checkAge(int age) throws AgeException {\n        // 检查年龄\n        \n    }\n    \n    public static void main(String[] args) {\n        // 调用并捕获异常\n        \n    }\n}`,
        testCases: [
            { checkType: 'structure', input: '无', expectedOutput: 'Invalid age: -1', requiredStructure: [{ type: 'hasClass', name: 'AgeException' }, { type: 'hasKeyword', keyword: 'throws' }, { type: 'hasKeyword', keyword: 'throw new' }] }
        ],
        hints: ['自定义异常继承 Exception 类', '使用 throw new 抛出异常']
    },
    {
        id: 20,
        title: '冒泡排序',
        difficulty: 'medium',
        tags: ['算法', '排序'],
        description: '实现冒泡排序算法，对数组 `{64, 34, 25, 12, 22, 11, 90}` 进行升序排序并输出。',
        examples: [{ input: '无', output: '11 12 22 25 34 64 90' }],
        templateCode: `public class Main {\n    // 实现冒泡排序方法\n    \n    public static void main(String[] args) {\n        int[] arr = {64, 34, 25, 12, 22, 11, 90};\n        // 排序并输出\n        \n    }\n}`,
        testCases: [
            { checkType: 'structure', input: '无', expectedOutput: '11 12 22 25 34 64 90', requiredStructure: [{ type: 'hasLoop' }, { type: 'hasKeyword', keyword: 'temp' }] },
            { checkType: 'contains', input: '无', expectedOutput: '11 12 22 25 34 64 90', requiredPatterns: ['for', 'for'] }
        ],
        hints: ['冒泡排序使用双重循环', '相邻元素比较并交换']
    },
    {
        id: 21,
        title: '二分查找',
        difficulty: 'medium',
        tags: ['算法', '查找'],
        description: '实现二分查找算法，在有序数组 `{2, 5, 8, 12, 16, 23, 38, 56, 72, 91}` 中查找 `23`，输出其索引。',
        examples: [{ input: 'target = 23', output: '5' }],
        templateCode: `public class Main {\n    // 实现二分查找方法\n    static int binarySearch(int[] arr, int target) {\n        \n    }\n    \n    public static void main(String[] args) {\n        int[] arr = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};\n        System.out.println(binarySearch(arr, 23));\n    }\n}`,
        testCases: [
            { checkType: 'structure', input: '无', expectedOutput: '5', requiredStructure: [{ type: 'hasMethod', name: 'binarySearch' }, { type: 'hasKeyword', keyword: 'mid' }] }
        ],
        hints: ['维护 left 和 right 指针', 'mid = (left + right) / 2']
    },
    {
        id: 22,
        title: '递归 - 斐波那契数列',
        difficulty: 'medium',
        tags: ['算法', '递归'],
        description: '使用递归方法计算斐波那契数列的第 10 项并输出。（F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)）',
        examples: [{ input: 'n = 10', output: '55' }],
        templateCode: `public class Main {\n    // 递归计算斐波那契\n    static int fib(int n) {\n        \n    }\n    \n    public static void main(String[] args) {\n        System.out.println(fib(10));\n    }\n}`,
        testCases: [
            { checkType: 'structure', input: '无', expectedOutput: '55', requiredStructure: [{ type: 'hasMethod', name: 'fib' }, { type: 'regex', pattern: 'fib\\s*\\(' }] }
        ],
        hints: ['基线条件：n <= 1 时返回 n', '递归：return fib(n-1) + fib(n-2)']
    },
    {
        id: 23,
        title: '字符串回文判断',
        difficulty: 'medium',
        tags: ['字符串', '算法'],
        description: '编写方法 `isPalindrome(String s)` 判断字符串是否为回文。测试 `"racecar"` 和 `"hello"`，分别输出结果。',
        examples: [{ input: '"racecar"', output: 'true\nfalse' }],
        templateCode: `public class Main {\n    static boolean isPalindrome(String s) {\n        // 判断回文\n        \n    }\n    \n    public static void main(String[] args) {\n        System.out.println(isPalindrome("racecar"));\n        System.out.println(isPalindrome("hello"));\n    }\n}`,
        testCases: [
            { checkType: 'structure', input: '无', expectedOutput: 'true\nfalse', requiredStructure: [{ type: 'hasMethod', name: 'isPalindrome' }] }
        ],
        hints: ['双指针法：一个从头一个从尾向中间移动']
    },
    {
        id: 24,
        title: '静态方法与变量',
        difficulty: 'easy',
        tags: ['OOP', 'static'],
        description: '定义一个 `Counter` 类，包含静态变量 `count`，每次创建实例 count+1。创建 3 个实例后输出 count。',
        examples: [{ input: '无', output: '3' }],
        templateCode: `class Counter {\n    // 静态变量和构造方法\n    \n}\n\npublic class Main {\n    public static void main(String[] args) {\n        // 创建 3 个实例并输出 count\n        \n    }\n}`,
        testCases: [
            { checkType: 'contains', input: '无', expectedOutput: '3', requiredPatterns: ['static', 'count', 'new Counter'] }
        ],
        hints: ['静态变量属于类而非实例', '在构造方法中 count++']
    },
    {
        id: 25,
        title: '抽象类',
        difficulty: 'medium',
        tags: ['OOP', '抽象类'],
        description: '定义抽象类 `Shape`（含抽象方法 `area()`），实现子类 `Circle`（半径 5）和 `Rectangle`（长 4 宽 6）。分别输出面积。',
        examples: [{ input: '无', output: '78.54\n24' }],
        templateCode: `abstract class Shape {\n    abstract double area();\n}\n\n// 实现 Circle 和 Rectangle\n\npublic class Main {\n    public static void main(String[] args) {\n        // 创建对象并输出面积\n        \n    }\n}`,
        testCases: [
            { checkType: 'structure', input: '无', expectedOutput: '78.54\n24', requiredStructure: [{ type: 'hasKeyword', keyword: 'abstract' }, { type: 'hasClass', name: 'Circle' }, { type: 'hasClass', name: 'Rectangle' }] }
        ],
        hints: ['Circle 面积 = π × r²，使用 Math.PI']
    },
    {
        id: 26,
        title: '选择排序',
        difficulty: 'medium',
        tags: ['算法', '排序'],
        description: '实现选择排序算法对数组 `{29, 10, 14, 37, 13}` 进行排序并输出。',
        examples: [{ input: '无', output: '10 13 14 29 37' }],
        templateCode: `public class Main {\n    static void selectionSort(int[] arr) {\n        // 实现选择排序\n        \n    }\n    \n    public static void main(String[] args) {\n        int[] arr = {29, 10, 14, 37, 13};\n        selectionSort(arr);\n        // 输出排序结果\n        \n    }\n}`,
        testCases: [
            { checkType: 'structure', input: '无', expectedOutput: '10 13 14 29 37', requiredStructure: [{ type: 'hasMethod', name: 'selectionSort' }, { type: 'hasLoop' }] }
        ],
        hints: ['每轮找最小值放到前面']
    },
    {
        id: 27,
        title: '链表实现',
        difficulty: 'hard',
        tags: ['数据结构', '链表'],
        description: '实现单链表 `LinkedList`，支持 `add(int val)` 和 `print()` 方法。添加 1, 2, 3 后打印链表。',
        examples: [{ input: '无', output: '1 -> 2 -> 3 -> null' }],
        templateCode: `class Node {\n    int val;\n    Node next;\n    Node(int val) { this.val = val; }\n}\n\nclass LinkedList {\n    Node head;\n    \n    // 实现 add 和 print 方法\n    \n}\n\npublic class Main {\n    public static void main(String[] args) {\n        LinkedList list = new LinkedList();\n        list.add(1);\n        list.add(2);\n        list.add(3);\n        list.print();\n    }\n}`,
        testCases: [
            { checkType: 'structure', input: '无', expectedOutput: '1 -> 2 -> 3 -> null', requiredStructure: [{ type: 'hasClass', name: 'Node' }, { type: 'hasClass', name: 'LinkedList' }, { type: 'hasMethod', name: 'add' }] }
        ],
        hints: ['Node 类包含 val 和 next 指针', 'add 时遍历到链表尾部']
    },
    {
        id: 28,
        title: '栈的实现',
        difficulty: 'hard',
        tags: ['数据结构', '栈'],
        description: '用数组实现栈 `MyStack`，支持 `push`、`pop`、`peek`。依次 push 10, 20, 30，然后 pop 一次并输出栈顶元素。',
        examples: [{ input: '无', output: '20' }],
        templateCode: `class MyStack {\n    private int[] data;\n    private int top;\n    \n    // 实现构造方法、push、pop、peek\n    \n}\n\npublic class Main {\n    public static void main(String[] args) {\n        MyStack stack = new MyStack();\n        stack.push(10);\n        stack.push(20);\n        stack.push(30);\n        stack.pop();\n        System.out.println(stack.peek());\n    }\n}`,
        testCases: [
            { checkType: 'structure', input: '无', expectedOutput: '20', requiredStructure: [{ type: 'hasClass', name: 'MyStack' }, { type: 'hasMethod', name: 'push' }, { type: 'hasMethod', name: 'pop' }, { type: 'hasMethod', name: 'peek' }] }
        ],
        hints: ['用 top 变量追踪栈顶位置', 'push 时 data[++top] = val']
    },
    {
        id: 29,
        title: '素数判断',
        difficulty: 'medium',
        tags: ['算法', '数学'],
        description: '编写方法 `isPrime(int n)` 判断是否为素数。输出 1-50 中所有素数，用空格分隔。',
        examples: [{ input: '无', output: '2 3 5 7 11 13 17 19 23 29 31 37 41 43 47' }],
        templateCode: `public class Main {\n    static boolean isPrime(int n) {\n        // 判断素数\n        \n    }\n    \n    public static void main(String[] args) {\n        // 输出 1-50 所有素数\n        \n    }\n}`,
        testCases: [
            { checkType: 'structure', input: '无', expectedOutput: '2 3 5 7 11 13 17 19 23 29 31 37 41 43 47', requiredStructure: [{ type: 'hasMethod', name: 'isPrime' }, { type: 'hasLoop' }] }
        ],
        hints: ['只需检查到 √n', '1 不是素数']
    },
    {
        id: 30,
        title: '字符串排列组合',
        difficulty: 'hard',
        tags: ['算法', '递归'],
        description: '使用递归生成字符串 `"ABC"` 的所有排列并输出。',
        examples: [{ input: '"ABC"', output: 'ABC\nACB\nBAC\nBCA\nCBA\nCAB' }],
        templateCode: `public class Main {\n    static void permute(String str, int l, int r) {\n        // 递归生成排列\n        \n    }\n    \n    public static void main(String[] args) {\n        String str = "ABC";\n        permute(str, 0, str.length() - 1);\n    }\n}`,
        testCases: [
            { checkType: 'structure', input: '无', expectedOutput: 'ABC\nACB\nBAC\nBCA\nCBA\nCAB', requiredStructure: [{ type: 'hasMethod', name: 'permute' }, { type: 'hasKeyword', keyword: 'swap' }] }
        ],
        hints: ['固定一个字符，递归排列剩余字符', '用 swap 交换字符位置']
    },
];

/**
 * 获取所有不重复的标签
 * @returns {string[]}
 */
export function getAllTags() {
    const tagSet = new Set();
    problems.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return [...tagSet];
}

/**
 * 根据 ID 获取题目
 * @param {number} id
 * @returns {Object|undefined}
 */
export function getProblemById(id) {
    return problems.find((p) => p.id === id);
}
