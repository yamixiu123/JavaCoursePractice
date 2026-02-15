/**
 * 前端模拟判题引擎
 * 通过代码结构分析和预设测试用例匹配来判定结果
 */

/**
 * 判题结果
 * @typedef {Object} JudgeResult
 * @property {boolean} accepted - 是否全部通过
 * @property {Array<TestCaseResult>} results - 每个测试用例的结果
 * @property {string} message - 概览消息
 */

/**
 * 单个测试用例结果
 * @typedef {Object} TestCaseResult
 * @property {number} id - 测试用例编号
 * @property {boolean} passed - 是否通过
 * @property {string} input - 输入
 * @property {string} expected - 期望输出
 * @property {string} actual - 实际输出（模拟）
 */

/**
 * 模拟判题
 * @param {string} code - 用户代码
 * @param {Object} problem - 题目对象
 * @returns {JudgeResult}
 */
export function judge(code, problem) {
    const trimmedCode = code.trim();

    // 基本检查：代码不能为空
    if (!trimmedCode) {
        return {
            accepted: false,
            results: [],
            message: '❌ 请输入代码后再提交',
        };
    }

    // 检查编译错误（简单语法检查）
    const syntaxError = checkBasicSyntax(trimmedCode);
    if (syntaxError) {
        return {
            accepted: false,
            results: [],
            message: `❌ 编译错误: ${syntaxError}`,
        };
    }

    // 根据题目类型进行判定
    const testCases = problem.testCases || [];
    const results = testCases.map((tc, index) => evaluateTestCase(trimmedCode, tc, index, problem));

    const passed = results.filter((r) => r.passed).length;
    const total = results.length;
    const accepted = passed === total && total > 0;

    return {
        accepted,
        results,
        message: accepted
            ? `✅ 通过！${passed}/${total} 个测试用例全部通过`
            : `❌ 未通过：${passed}/${total} 个测试用例通过`,
    };
}

/**
 * 基本语法检查
 * @param {string} code
 * @returns {string|null} 错误信息或 null
 */
function checkBasicSyntax(code) {
    // 检查大括号匹配
    let braceCount = 0;
    for (const char of code) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (braceCount < 0) return '大括号不匹配';
    }
    if (braceCount !== 0) return '大括号不匹配';

    // 检查小括号匹配
    let parenCount = 0;
    for (const char of code) {
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        if (parenCount < 0) return '小括号不匹配';
    }
    if (parenCount !== 0) return '小括号不匹配';

    return null;
}

/**
 * 评估单个测试用例
 * @param {string} code
 * @param {Object} testCase
 * @param {number} index
 * @param {Object} problem
 * @returns {TestCaseResult}
 */
function evaluateTestCase(code, testCase, index, problem) {
    const result = {
        id: index + 1,
        input: testCase.input || '无',
        expected: testCase.expectedOutput,
        actual: '',
        passed: false,
    };

    // 使用关键词检查方式判定
    if (testCase.checkType === 'contains') {
        // 检查代码是否包含所需关键词/结构
        const allMatch = testCase.requiredPatterns.every((pattern) => {
            if (pattern.startsWith('/') && pattern.endsWith('/')) {
                const regex = new RegExp(pattern.slice(1, -1));
                return regex.test(code);
            }
            return code.includes(pattern);
        });

        result.passed = allMatch;
        result.actual = allMatch ? testCase.expectedOutput : '代码结构不符合要求';
    } else if (testCase.checkType === 'output') {
        // 通过简单的代码分析来模拟评估输出
        const simulatedOutput = simulateOutput(code, testCase, problem);
        result.actual = simulatedOutput;
        result.passed = normalizeOutput(simulatedOutput) === normalizeOutput(testCase.expectedOutput);
    } else if (testCase.checkType === 'structure') {
        // 代码结构检查
        const structureOk = checkCodeStructure(code, testCase.requiredStructure);
        result.passed = structureOk;
        result.actual = structureOk ? '代码结构正确' : '代码结构不符合要求';
    }

    return result;
}

/**
 * 简单模拟代码输出
 * 通过分析 println 语句来推测输出
 */
function simulateOutput(code, testCase) {
    // 提取所有 System.out.println 和 System.out.print 的参数
    const printMatches = [];
    const printlnRegex = /System\.out\.println\s*\(\s*(.+?)\s*\)\s*;/g;
    const printRegex = /System\.out\.print\s*\(\s*(.+?)\s*\)\s*;/g;

    let match;
    while ((match = printlnRegex.exec(code)) !== null) {
        printMatches.push({ text: match[1], newline: true });
    }
    while ((match = printRegex.exec(code)) !== null) {
        printMatches.push({ text: match[1], newline: false });
    }

    if (printMatches.length === 0) {
        return '（无输出）';
    }

    // 简单处理输出内容
    const output = printMatches
        .map((m) => {
            let val = m.text.trim();
            // 字符串字面量
            if (val.startsWith('"') && val.endsWith('"')) {
                return val.slice(1, -1);
            }
            // 数字
            if (/^\d+(\.\d+)?$/.test(val)) {
                return val;
            }
            // 简单拼接（含 +）
            if (val.includes('+')) {
                return evaluateStringConcat(val);
            }
            return val;
        })
        .join('\n');

    return output;
}

/**
 * 简单的字符串拼接求值
 */
function evaluateStringConcat(expr) {
    const parts = expr.split('+').map((p) => p.trim());
    return parts
        .map((p) => {
            if (p.startsWith('"') && p.endsWith('"')) {
                return p.slice(1, -1);
            }
            return p;
        })
        .join('');
}

/**
 * 检查代码结构
 */
function checkCodeStructure(code, requiredStructure) {
    if (!requiredStructure) return true;

    for (const requirement of requiredStructure) {
        switch (requirement.type) {
            case 'hasClass':
                if (!new RegExp(`class\\s+${requirement.name}`).test(code)) return false;
                break;
            case 'hasMethod':
                if (!new RegExp(`(public|private|protected)?\\s*(static\\s+)?\\w+\\s+${requirement.name}\\s*\\(`).test(code))
                    return false;
                break;
            case 'hasLoop':
                if (!/\b(for|while|do)\s*[\({]/.test(code)) return false;
                break;
            case 'hasIfElse':
                if (!/\bif\s*\(/.test(code)) return false;
                break;
            case 'hasArray':
                if (!/\w+\s*\[\s*\]/.test(code) && !code.includes('new ')) return false;
                break;
            case 'hasKeyword':
                if (!code.includes(requirement.keyword)) return false;
                break;
            case 'regex':
                if (!new RegExp(requirement.pattern).test(code)) return false;
                break;
        }
    }

    return true;
}

/**
 * 标准化输出（去除多余空白）
 */
function normalizeOutput(output) {
    return output
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join('\n');
}
