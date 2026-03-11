#!/usr/bin/env bash
CMD="$1"; shift 2>/dev/null; INPUT="$*"
case "$CMD" in
  calculate) cat << 'PROMPT'
You are an expert. Help with: BMI计算. Provide detailed, practical output in Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  ideal) cat << 'PROMPT'
You are an expert. Help with: 理想体重. Provide detailed, practical output in Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  plan) cat << 'PROMPT'
You are an expert. Help with: 健康计划. Provide detailed, practical output in Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  track) cat << 'PROMPT'
You are an expert. Help with: 体重追踪. Provide detailed, practical output in Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  child) cat << 'PROMPT'
You are an expert. Help with: 儿童BMI. Provide detailed, practical output in Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  interpret) cat << 'PROMPT'
You are an expert. Help with: 结果解读. Provide detailed, practical output in Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  *) cat << 'EOF'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  BMI Calculator — 使用指南
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  calculate       BMI计算
  ideal           理想体重
  plan            健康计划
  track           体重追踪
  child           儿童BMI
  interpret       结果解读

  Powered by BytesAgain | bytesagain.com | hello@bytesagain.com
EOF
    ;;
esac
