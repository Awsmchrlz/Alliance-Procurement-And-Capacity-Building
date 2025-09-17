# 🏗️ Alliance Procurement & Capacity Building - Clean Project Structure

## 📁 **Organized Project Layout**

```
├── 📁 client/                    # Frontend React Application
│   ├── 📁 src/
│   │   ├── 📁 components/        # Reusable UI components
│   │   ├── 📁 hooks/            # Custom React hooks
│   │   ├── 📁 lib/              # Utilities and configurations
│   │   └── 📁 pages/            # Route pages
│   └── 📄 index.html
│
├── 📁 server/                    # Backend Express Application
│   ├── 📄 index.ts             # Server entry point
│   ├── 📄 routes.ts             # API routes
│   ├── 📄 storage.ts            # Database operations
│   ├── 📄 email-service.ts      # Email functionality
│   └── 📄 evidence-resolver.ts  # File handling
│
├── 📁 shared/                    # Shared TypeScript types
│   └── 📄 schema.ts             # Database schema & validation
│
├── 📁 supabase/                  # Database configuration
│   └── 📄 config.sql            # Database setup
│
├── 📁 tests/                     # All test and debug files
│   ├── 📄 debug-evidence-update.js
│   ├── 📄 test-email-system.js
│   ├── 📄 test-email-template.js
│   ├── 📄 test-user-registration.js
│   ├── 📄 create-admin-user.js
│   ├── 📄 fix-evidence-paths.js
│   └── 📄 enhanced-email-templates.ts
│
├── 📁 docs/                      # Documentation
│   ├── 📄 DATABASE_SETUP.md     # Database documentation
│   └── 📄 GROUP_PAYMENT_FEATURE.md # Feature documentation
│
├── 📄 ULTIMATE_DATABASE_SETUP.sql # 🎯 THE ONLY SQL FILE YOU NEED
├── 📄 PROJECT_STRUCTURE.md       # This file
├── 📄 README.md                  # Project overview
├── 📄 package.json              # Dependencies
└── 📄 tsconfig.json             # TypeScript config
```

## 🎯 **Key Files You Need to Know**

### **🔥 Most Important**
- `ULTIMATE_DATABASE_SETUP.sql` - **THE ONLY SQL FILE YOU NEED TO RUN**
- `client/src/components/registration-dialog.tsx` - Main registration component
- `server/routes.ts` - All API endpoints
- `shared/schema.ts` - Database types and validation

### **🚀 Getting Started**
1. **Database**: Run `ULTIMATE_DATABASE_SETUP.sql` in Supabase
2. **Frontend**: `npm run dev` (from root)
3. **Backend**: `npm run server` (from root)

### **🧪 Testing & Debug**
- All test files are in `tests/` folder
- Debug scripts for troubleshooting
- Admin utilities for user management

### **📚 Documentation**
- `docs/` contains all feature documentation
- `README.md` for project overview
- Inline code comments for complex logic

## ✅ **What's Been Cleaned Up**

- ✅ **Removed duplicate SQL files** - Only one universal file remains
- ✅ **Organized test files** - All in dedicated `tests/` folder
- ✅ **Moved documentation** - Clean `docs/` folder
- ✅ **Removed old migrations** - No more confusion
- ✅ **Clean root directory** - Only essential files

## 🔧 **Development Workflow**

1. **Feature Development**: Work in appropriate folders
2. **Testing**: Use files in `tests/` folder
3. **Database Changes**: Update `ULTIMATE_DATABASE_SETUP.sql`
4. **Documentation**: Update files in `docs/`
5. **Deployment**: Single SQL file + code deployment

## 🎉 **Benefits of Clean Structure**

- ✅ **No Confusion**: One SQL file to rule them all
- ✅ **Easy Navigation**: Clear folder structure
- ✅ **Maintainable**: Easy to find and modify code
- ✅ **Scalable**: Structured for growth
- ✅ **Professional**: Production-ready organization

---

**🎯 Your codebase is now clean, organized, and production-ready!**