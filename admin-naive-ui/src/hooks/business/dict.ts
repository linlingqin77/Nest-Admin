import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { fetchDictFindOneDataType } from '@/service/api-gen';
import type { DictDataResponseDto } from '@/service/api-gen/types';
import { useDictStore } from '@/store/modules/dict';
import { isNull } from '@/utils/common';
import { $t } from '@/locales';

export function useDict(dictType: string, immediate: boolean = true) {
  const dictStore = useDictStore();
  const { dictData: dictList } = storeToRefs(dictStore);

  const data = ref<DictDataResponseDto[]>([]);
  const record = ref<Record<string, string>>({});
  const options = ref<CommonType.Option[]>([]);

  async function getData() {
    const dicts = dictStore.getDict(dictType);
    if (dicts) {
      data.value = dicts as DictDataResponseDto[];
      return;
    }
    try {
      const { data: dictData } = await fetchDictFindOneDataType(dictType);
      if (!dictData) {
        return;
      }
      const dictDataList = dictData as DictDataResponseDto[];
      dictDataList.forEach(dict => {
        if (dict.dictLabel?.startsWith(`dict.${dictType}.`)) {
          dict.dictLabel = $t(dict.dictLabel as App.I18n.I18nKey);
        }
      });
      dictStore.setDict(dictType, dictDataList as unknown as Api.System.DictData[]);
      data.value = dictDataList;
    } catch {
      // error handled by request interceptor
    }
  }

  async function getRecord() {
    if (!data.value.length) {
      await getData();
    }
    data.value.forEach(dict => {
      record.value[dict.dictValue!] = dict.dictLabel!;
    });
  }

  async function getOptions() {
    if (!data.value.length) {
      await getData();
    }

    options.value = data.value.map(dict => ({ label: dict.dictLabel!, value: dict.dictValue! }));
  }

  function transformDictData(dictValue: string[] | number[] | string | number) {
    if (!data.value.length || isNull(dictValue)) return undefined;
    if (Array.isArray(dictValue)) {
      return data.value.filter(dict => dictValue.some(value => dict.dictValue === value.toString()));
    }
    return data.value.filter(dict => dict.dictValue === dictValue.toString());
  }

  if (immediate) {
    getData().then(() => {
      getRecord();
      getOptions();
    });
  } else {
    watch(
      () => dictList.value[dictType],
      val => {
        if (val && val.length) {
          getRecord();
          getOptions();
        }
      },
      { immediate: true }
    );
  }

  return {
    data,
    record,
    options,
    getData,
    getRecord,
    getOptions,
    transformDictData
  };
}
