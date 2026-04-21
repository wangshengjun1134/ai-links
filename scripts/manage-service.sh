#!/bin/bash
# AI Links 服务管理脚本

SERVICE_NAME="ai-links"
LOG_FILE="/var/log/ai-links-server.log"

case "$1" in
    start)
        echo "🚀 启动 AI Links 服务..."
        systemctl start $SERVICE_NAME
        sleep 2
        systemctl status $SERVICE_NAME --no-pager | head -5
        ;;
    stop)
        echo "🛑 停止 AI Links 服务..."
        systemctl stop $SERVICE_NAME
        echo "✅ 服务已停止"
        ;;
    restart)
        echo "🔄 重启 AI Links 服务..."
        systemctl restart $SERVICE_NAME
        sleep 2
        systemctl status $SERVICE_NAME --no-pager | head -5
        ;;
    status)
        systemctl status $SERVICE_NAME --no-pager
        ;;
    logs)
        echo "📋 最近 50 行日志:"
        tail -50 $LOG_FILE
        ;;
    enable)
        echo "⚙️ 启用开机自启动..."
        systemctl enable $SERVICE_NAME
        echo "✅ 已设置开机自启动"
        ;;
    disable)
        echo "⚙️ 禁用开机自启动..."
        systemctl disable $SERVICE_NAME
        echo "✅ 已禁用开机自启动"
        ;;
    *)
        echo "用法：$0 {start|stop|restart|status|logs|enable|disable}"
        echo ""
        echo "命令说明:"
        echo "  start   - 启动服务"
        echo "  stop    - 停止服务"
        echo "  restart - 重启服务"
        echo "  status  - 查看服务状态"
        echo "  logs    - 查看最近日志"
        echo "  enable  - 启用开机自启动"
        echo "  disable - 禁用开机自启动"
        exit 1
        ;;
esac
