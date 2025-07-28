import copyText from './common/copyText';

export default function directive(app: any) {
    app.directive('copyText', copyText);
}
