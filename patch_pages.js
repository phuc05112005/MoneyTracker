const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf-8');
  for (const [search, replace] of replacements) {
    // using split join to replace all occurrences without regex escaping issues
    content = content.split(search).join(replace);
  }
  fs.writeFileSync(filePath, content);
  console.log('Updated ' + filePath);
}

// 1. Wallets
replaceInFile(
  path.join('src', 'app', '(app)', 'wallets', 'page.tsx'),
  [
    ['"Lỗi khi tải danh sách Ví"', 't("loadWalletError")'],
    ['"Đã cập nhật Ví"', 't("walletUpdated")'],
    ['"Đã thêm Ví mới"', 't("walletAdded")'],
    ['"Lỗi khi lưu Ví"', 't("saveWalletError")'],
    ['"Đã xóa Ví"', 't("walletDeleted")'],
    ['"Không thể xóa Ví"', 't("deleteWalletError")'],
    ['"Sửa Ví"', 't("editWallet")'],
    ['"Thêm Ví mới"', 't("addWallet")'],
    ['Tên Ví', '{t("walletName")}'],
    ['"Ví dụ: Tiền mặt, Vietcombank, Momo..."', 't("walletNamePlaceholder")'],
    ['Số dư ban đầu', '{t("initialBalance")}'],
    ['"Lưu thay đổi"', 't("saveChanges")'],
    ['"Thêm Ví"', 't("addWallet")'],
    ['Hủy', '{t("cancel")}'],
    ['Danh sách Ví', '{t("walletList")}'],
    ['Chưa có ví nào. Hãy tạo một ví mới!', '{t("noWallets")}']
  ]
);

// 2. Categories
replaceInFile(
  path.join('src', 'app', '(app)', 'categories', 'page.tsx'),
  [
    ['"Lỗi khi tải danh sách Danh mục"', 't("loadCategoryError")'],
    ['"Đã cập nhật Danh mục"', 't("categoryUpdated")'],
    ['"Đã thêm Danh mục mới"', 't("categoryAdded")'],
    ['"Lỗi khi lưu Danh mục"', 't("saveCategoryError")'],
    ['"Đã xóa Danh mục"', 't("categoryDeleted")'],
    ['"Không thể xóa Danh mục"', 't("deleteCategoryError")'],
    ['"Sửa Danh mục"', 't("editCategory")'],
    ['"Thêm Danh mục"', 't("addCategory")'],
    ['Tên Danh mục', '{t("categoryName")}'],
    ['"Ví dụ: Lương, Ăn uống..."', 't("categoryNamePlaceholder")'],
    ['>Loại<', '>{t("type")}<'],
    ['>Chi phí (Expense)<', '>{t("expense")}<'],
    ['>Thu nhập (Income)<', '>{t("income")}<'],
    ['Màu sắc', '{t("color")}'],
    ['"Lưu thay đổi"', 't("saveChanges")'],
    ['Hủy', '{t("cancel")}'],
    ['Danh sách Danh mục', '{t("categoryList")}'],
    ['Chưa có danh mục nào.', '{t("noCategories")}'],
    ['"Thu nhập"', 't("income")'],
    ['"Chi phí"', 't("expense")']
  ]
);

// 3. Profile
replaceInFile(
  path.join('src', 'app', '(app)', 'profile', 'page.tsx'),
  [
    ['"Bạn có chắc chắn muốn xóa tất cả dữ liệu (Thu, Chi, Ngân sách) không? Hành động này không thể hoàn tác."', 't("confirmResetData")'],
    ['"Reset dữ liệu thành công ✓"', 't("resetDataSuccess")'],
    ['"Lỗi"', 't("error")'],
    ['"Không thể reset dữ liệu."', 't("resetDataError")'],
    ['Khu vực nguy hiểm', '{t("dangerZone")}'],
    ['Reset dữ liệu giao dịch', '{t("resetTransactionData")}'],
    ['Xóa toàn bộ thu nhập, chi phí và ngân sách của bạn (ví dụ: khi đổi đơn vị tiền tệ). Không thể hoàn tác.', '{t("resetDataDesc")}'],
    ['"Đang xử lý..."', 't("processing")'],
    ['"Reset toàn bộ dữ liệu"', 't("resetAllData")']
  ]
);
