/** @jsx html */
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { html, RenderingContext, IView, SButtonImpl } from 'sprotty';

@injectable()
export class PaletteButtonView implements IView {
    render(button: SButtonImpl, context: RenderingContext): VNode {
        return <div>{button.id}</div>;
    }
}