<template>
    <div>
        <ul>
            <li v-for="feature in features" :key=feature.id>{{feature.name}}</li>
        </ul>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator'
    type Feature = {
        id: number;
        name: string;
    }
    type FeatureSelect = Feature & {selected: boolean}
    @Component
    export default class hello extends Vue{
        features: FeatureSelect[] = [
            {
                id: 1,
                name: "类型注解",
                selected: false
            },
            {
                id: 2,
                name: "编译型语言",
                selected: true
            }
        ]
    }
</script>

<style lang="scss" scoped>

</style>