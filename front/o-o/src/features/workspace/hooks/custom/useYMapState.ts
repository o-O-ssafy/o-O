import { useEffect, useState } from "react";
import * as Y from "yjs";

/**
 * Subscribes to a Y.Map instance and mirrors its JSON representation as React state.
 *
 * **최적화:**
 * - 초기 로드 시에만 toJSON() 사용
 * - 이후 변경사항은 증분 업데이트로 처리하여 불필요한 객체 재생성 방지
 * - 무한 리렌더링 방지
 */
export const useYMapState = <TValue,>(
  yMap?: Y.Map<TValue>
): Record<string, TValue> => {
  const [state, setState] = useState<Record<string, TValue>>({});

  // ✅ 중복 감지 카운터 (진단용)
  const nodeInsertCount = new Map<string, number>();

  useEffect(() => {
    if (!yMap) {
      setState({});
      return;
    }

    // 초기 로드만 toJSON() 사용
    const initialState = yMap.toJSON() as Record<string, TValue>;
    setState(initialState);

    // 이후에는 증분 업데이트로 성능 최적화
    const observer = (event: Y.YMapEvent<TValue>, transaction: Y.Transaction) => {
      // 🛡️ GUARD: event, transaction, yMap이 유효한지 확인
      if (!event || !transaction || !yMap) {
        console.warn(`⚠️ [Y.Map Observer] Invalid observer call: event=${!!event}, transaction=${!!transaction}, yMap=${!!yMap}`);
        return;
      }

      // 📊 [LOG] Y.Map 옵저버 트리거
      console.log(`📊 [Y.Map Observer] Transaction origin="${transaction.origin}", keys changed=${event.keysChanged.size}`);
      console.log(`📊 [Y.Map Observer] Changed keys:`, Array.from(event.keysChanged));

      // 변경사항이 없으면 조기 반환
      if (!event.keysChanged || event.keysChanged.size === 0) {
        return;
      }

      // ✅ 정상적인 업데이트 origin은 중복 체크에서 제외
      const shouldSkipDuplicateCheck =
        transaction.origin === 'position-update' ||
        transaction.origin === 'mindmap-bootstrap' ||
        transaction.origin === 'remote' ||
        typeof transaction.origin === 'object'; // Y.js 내부 sync (origin이 객체인 경우)

      if (shouldSkipDuplicateCheck) {
        console.log(`📊 [Y.Map Observer] Skipping duplicate check for origin="${transaction.origin}" (type: ${typeof transaction.origin})`);
      }

      // ⚠️ IMPORTANT: event.changes는 동기적으로만 접근 가능
      // setState 콜백 내부에서 접근하면 "You must not compute changes after the event-handler fired" 에러 발생
      // 따라서 변경사항을 미리 계산해야 함
      const changesToApply: Array<{ key: string; action: 'delete' | 'update'; value?: TValue }> = [];

      for (const key of event.keysChanged) {
        // 🛡️ GUARD: key가 유효한지 확인
        if (!key || typeof key !== 'string') {
          console.warn(`⚠️ [Y.Map Observer] Invalid key:`, key);
          continue;
        }

        const action = event.changes?.keys?.get(key);

        if (action?.action === 'delete') {
          changesToApply.push({ key, action: 'delete' });
          // 삭제 시 카운터 초기화
          nodeInsertCount.delete(key);
        } else {
          const value = yMap.get(key);

          // 🛡️ GUARD: value가 undefined이거나 null인 경우 건너뜀
          if (value === undefined || value === null) {
            console.warn(`⚠️ [Y.Map Observer] Skipping undefined/null value for key="${key}"`);
            continue;
          }

          // 🛡️ GUARD: value가 객체가 아닌 경우 건너뜀
          if (typeof value !== 'object') {
            console.warn(`⚠️ [Y.Map Observer] Skipping non-object value for key="${key}", type=${typeof value}`);
            continue;
          }

          // ✅ 중복 감지: add/update 액션 추적 (정상 origin 제외)
          if (!shouldSkipDuplicateCheck && (action?.action === 'add' || action?.action === 'update')) {
            const count = (nodeInsertCount.get(key) || 0) + 1;
            nodeInsertCount.set(key, count);

            if (count > 1) {
              console.error(`🚨 [DUPLICATE DETECTED] Node "${key}" inserted/updated ${count} times!`);
              console.error(`   Transaction origin: "${transaction.origin}"`);
              console.error(`   Action: ${action.action}`);
              console.error(`   Stack trace:`, new Error(`Duplicate detection for key: ${key}`).stack);
            }
          }

          // 🛡️ GUARD: keyword 필드 검증
          // @ts-ignore
          if (!('keyword' in value)) {
            console.warn(`⚠️ [Y.Map Observer] Skipping node without keyword field, key="${key}"`);
            continue;
          }

          // 🛡️ GUARD: id 필드 검증
          // @ts-ignore
          if (!('id' in value)) {
            console.warn(`⚠️ [Y.Map Observer] Skipping node without id field, key="${key}"`);
            continue;
          }

          changesToApply.push({ key, action: 'update', value });
        }
      }

      // 변경사항이 없으면 setState 호출하지 않음
      if (changesToApply.length === 0) {
        return;
      }

      // 계산된 변경사항을 React state에 적용
      setState(prev => {
        const next = { ...prev };  // shallow copy
        let hasChanges = false;

        for (const change of changesToApply) {
          if (change.action === 'delete') {
            if (change.key in next) {
              console.log(`🗑️ [Y.Map Observer] Deleting key="${change.key}"`);
              delete next[change.key];
              hasChanges = true;
            }
          } else {
            // 값이 실제로 변경되었는지 체크 (shallow equality)
            if (next[change.key] !== change.value) {
              console.log(`📝 [Y.Map Observer] Updating key="${change.key}"`);
              next[change.key] = change.value!;
              hasChanges = true;
            }
          }
        }

        // 실제 변경사항이 없으면 이전 상태 반환 (참조 유지)
        console.log(`📊 [Y.Map Observer] State update: hasChanges=${hasChanges}, total nodes=${Object.keys(next).length}`);
        return hasChanges ? next : prev;
      });
    };

    yMap.observe(observer);

    return () => {
      yMap.unobserve(observer);
    };
  }, [yMap]);

  return state;
};
