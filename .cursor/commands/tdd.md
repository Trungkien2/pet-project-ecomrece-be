# tdd

Tạo Technical Design Document từ feature request hoặc screen specification.

## Usage

```
/tdd @<screen_folder_or_feature_doc>
```

## Example

```
/tdd @docs/Fe/screens/register
```

## What it does

1. Đọc feature request / screen specification
2. Analyze existing codebase (schema, modules, components)
3. Tạo TDD với các sections:
   - Overview
   - Requirements (Functional, Non-Functional)
   - Technical Design (Database, Backend, Frontend)
   - Logic Flow (Sequence diagrams)
   - Security & Performance
   - Testing Plan
   - Alternatives Considered
   - Implementation Checklist

## Output

File: `tdd-<feature>.md` trong cùng folder với input

## Rules Applied

See: `.cursor/rules/tdd-generation-rules.mdc`
