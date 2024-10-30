abstract class ValueObject<T> {
  protected readonly props: T;

  protected constructor(props: T) {
    this.props = Object.freeze(props);
  }

  public equals(other: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (other.constructor !== this.constructor) {
      return false;
    }

    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }

  public getProps(): T {
    return this.props;
  }
}

export default ValueObject;
