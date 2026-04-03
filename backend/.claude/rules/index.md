## 📜 Rules

1. **Architecture**: Never import NestJS-specific decorators inside `core/domain`.
2. **RBAC**: All new API endpoints MUST have a `@RequirePermission` decorator.
3. **Naming**: Use PascalCase for components, kebab-case for files.
