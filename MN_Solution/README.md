# MN_Solution

Hệ nền web CAD/DAC chạy offline trước, chuẩn bị để phát hành online sau này.

## Module chính

- MN_Drawing: hệ vẽ 2D / dựng hình cơ bản
- MN_Cad: xử lý CAD, biên dạng, kích thước, chi tiết
- MN_Gcode: xuất đường chạy dao / G-code

## Quy tắc tổ chức

- `core/`: lõi hệ thống dùng chung
- `apps/`: các app/module con
- `ui/`: giao diện, layout, component, theme
- `scripts/`: canvas, tools, managers, utils
- `icons/`: icon SVG
- `data/`: thư viện, dữ liệu mặc định, file mẫu
- `config/`: cấu hình app/module/path/online
- `export/`: vùng xuất file offline
